import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import User from '../models/User.js';

/**
 * @route   GET /api/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const users = await User.find().sort({ createdAt: -1 }).limit(limit);

  return sendSuccess(res, {
    count: users.length,
    users: users.map((u) => u.toSafeObject()),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  return sendSuccess(res, { user: user.toSafeObject() });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent superadmin role revocation (safety check if req.user.email matches a master admin)
  // For now just allow it if the current user is admin, but maybe protect current user
  if (user.id === req.user.id) {
    res.status(400);
    throw new Error('Cannot change your own role');
  }

  user.role = req.body.role || user.role;
  await user.save();

  return sendSuccess(res, { user: user.toSafeObject() });
});
