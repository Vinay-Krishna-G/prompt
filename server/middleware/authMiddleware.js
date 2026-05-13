import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Requires `Authorization: Bearer <jwt>`.
 * Attaches the full user document to `req.user` (password never selected).
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Not authorized. Please provide a Bearer token.', 401));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new AppError('Not authorized. Empty token.', 401));
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.userId);

  if (!user) {
    return next(new AppError('The user for this token no longer exists.', 401));
  }

  req.user = user;
  req.auth = { userId: user._id.toString(), role: user.role };
  next();
});

/**
 * Must run after `protect`. Allows only `role === 'admin'`.
 */
export const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin privileges required', 403));
  }
  next();
};
