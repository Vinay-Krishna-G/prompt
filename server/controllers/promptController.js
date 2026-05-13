import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Fetch prompts placeholder
export const getAllPrompts = asyncHandler(async (req, res, next) => {
  next(new AppError('Prompts endpoint not implemented', 501));
});
