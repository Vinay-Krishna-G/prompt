import Category from '../models/Category.js';
import Prompt from '../models/Prompt.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 }).lean();

  // Attach live prompt count to each category
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Prompt.countDocuments({ category: cat.name });
      return { ...cat, promptCount: count };
    }),
  );

  sendSuccess(res, { categories: withCounts });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  sendSuccess(res, { category }, 201);
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  sendSuccess(res, { category });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  sendSuccess(res, null, 204);
});
