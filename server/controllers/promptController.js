import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import Prompt from '../models/Prompt.js';

// @desc    Create a prompt
// @route   POST /api/prompts
// @access  Private/Admin
export const createPrompt = asyncHandler(async (req, res, next) => {
  // Set creator to current user
  const promptData = { ...req.body, creator: req.user._id };

  const prompt = await Prompt.create(promptData);

  return sendSuccess(res, prompt, 201);
});

// @desc    Get all prompts
// @route   GET /api/prompts
// @access  Public
export const getPrompts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search, category, trending } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  // Search by title or tags using text index
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by trending
  if (trending === 'true') {
    query.isTrending = true;
  }

  const prompts = await Prompt.find(query)
    .populate('creator', 'name avatar')
    .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Prompt.countDocuments(query);

  return sendSuccess(res, {
    prompts,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get single prompt by slug
// @route   GET /api/prompts/:slug
// @access  Public
export const getPromptBySlug = asyncHandler(async (req, res, next) => {
  const prompt = await Prompt.findOne({ slug: req.params.slug }).populate('creator', 'name avatar');

  if (!prompt) {
    return next(new AppError('Prompt not found', 404));
  }

  // Increment views
  prompt.views += 1;
  await prompt.save({ validateBeforeSave: false });

  return sendSuccess(res, prompt);
});

// @desc    Update prompt
// @route   PUT /api/prompts/:id
// @access  Private/Admin
export const updatePrompt = asyncHandler(async (req, res, next) => {
  let prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    return next(new AppError('Prompt not found', 404));
  }

  prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('creator', 'name avatar');

  return sendSuccess(res, prompt);
});

// @desc    Delete prompt
// @route   DELETE /api/prompts/:id
// @access  Private/Admin
export const deletePrompt = asyncHandler(async (req, res, next) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    return next(new AppError('Prompt not found', 404));
  }

  await prompt.deleteOne();

  return sendSuccess(res, { message: 'Prompt removed' });
});
