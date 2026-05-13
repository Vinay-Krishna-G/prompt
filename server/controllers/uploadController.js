import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Mock upload controller
export const uploadAsset = asyncHandler(async (req, res, next) => {
  next(new AppError('Upload endpoint not implemented', 501));
});
