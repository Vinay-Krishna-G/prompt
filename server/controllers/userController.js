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
