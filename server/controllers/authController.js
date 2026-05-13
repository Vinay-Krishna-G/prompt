import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { signAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { env } from '../config/env.js';

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

  const user = await User.create({
    name,
    email,
    password,
    avatar: resolveAvatar(name, avatar),
    role,
  });

  const token = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return sendSuccess(
    res,
    {
      token,
      user: user.toSafeObject(),
    },
    201,
  );
});

/**
 * @route   POST /api/auth/login
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
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
