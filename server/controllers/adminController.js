import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import User from '../models/User.js';
import { env } from '../config/env.js';

/**
 * @route   GET /api/admin/stats
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, adminCount, recentUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
  ]);

  return sendSuccess(res, {
    totalUsers,
    adminCount,
    recentUsers: recentUsers.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    })),
    environment: env.nodeEnv,
  });
});
