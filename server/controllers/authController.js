import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { signAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';

const resolveAvatar = (name, avatar) => {
  const fromInput = typeof avatar === 'string' && avatar.trim();
  if (fromInput) return fromInput.slice(0, 8);
  const initial = name.trim().charAt(0);
  return initial ? initial.toUpperCase() : 'U';
};

/**
 * @route   POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;

  let role = 'user';
  if (env.initialAdminEmail && email === env.initialAdminEmail) {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) role = 'admin';
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  const user = await User.create({
    name,
    email,
    password,
    avatar: resolveAvatar(name, avatar),
    role,
    otpCode: otp,
    otpExpires,
  });

  try {
    await sendEmail({
      to: email,
      subject: 'PromptVault - Verify Your Account',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Welcome to PromptVault!</h2>
          <p>Please use the following OTP to verify your account. It expires in 10 minutes.</p>
          <h1 style="background: #f4f4f5; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email failed to send, but user created.', err);
  }

  return sendSuccess(
    res,
    {
      message: 'Registration successful. Please check your email for the OTP.',
      userId: user._id,
    },
    201,
  );
});

/**
 * @route   POST /api/auth/login
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +isVerified');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isVerified) {
    return next(new AppError('Please verify your email address before logging in.', 403));
  }

  const token = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return sendSuccess(res, {
    token,
    user: user.toSafeObject(),
  });
});

/**
 * @route   POST /api/auth/verify
 */
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otpCode +otpExpires +isVerified');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isVerified) {
    return next(new AppError('Account is already verified', 400));
  }

  if (user.otpCode !== otp) {
    return next(new AppError('Invalid OTP', 400));
  }

  if (user.otpExpires < Date.now()) {
    return next(new AppError('OTP has expired', 400));
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const token = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return sendSuccess(res, {
    message: 'Email verified successfully',
    token,
    user: user.toSafeObject(),
  });
});

/**
 * @route   POST /api/auth/resend-otp
 */
export const resendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isVerified) {
    return next(new AppError('Account is already verified', 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  user.otpCode = otp;
  user.otpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: email,
      subject: 'PromptVault - New OTP',
      html: `<div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>PromptVault Verification</h2>
          <p>Here is your new OTP. It expires in 10 minutes.</p>
          <h1 style="background: #f4f4f5; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        </div>`
    });
  } catch (err) {
    return next(new AppError('Failed to send email. Please try again.', 500));
  }

  return sendSuccess(res, { message: 'A new OTP has been sent to your email.' });
});

/**
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendSuccess(res, { message: 'If an account with that email exists, we sent a password reset link.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

  await user.save({ validateBeforeSave: false });

  // In production, this would be your frontend URL
  const resetUrl = `${env.isProd ? 'https://yourdomain.com' : 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: email,
      subject: 'PromptVault - Password Reset',
      html: `<p>You requested a password reset. Click the link below to reset your password. It expires in 30 minutes.</p>
             <a href="${resetUrl}">Reset Password</a>`
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send reset email. Please try again.', 500));
  }

  return sendSuccess(res, { message: 'If an account with that email exists, we sent a password reset link.' });
});

/**
 * @route   POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return sendSuccess(res, { message: 'Password has been reset successfully. You can now log in.' });
});

/**
 * Stateless JWT: client discards the token. Endpoint provided for symmetry and future revocation.
 * @route   POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, { message: 'Logged out successfully' });
});

/**
 * @route   GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, { user: req.user.toSafeObject() });
});
