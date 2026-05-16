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
  const { page = 1, limit = 10, search, category, trending, type, sort } = req.query;

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

  // Filter by type
  if (type && ['image', 'video'].includes(type)) {
    query.type = type;
  }

  // Filter by trending
  if (trending === 'true') {
    query.isTrending = true;
  }

  // Filter by promptType (visual/workflow)
  if (req.query.promptType) {
    if (req.query.promptType === 'visual') {
      query.$or = [
        { promptType: 'visual' },
        { promptType: { $exists: false } },
        { promptType: null }
      ];
    } else {
      query.promptType = req.query.promptType;
    }
  }

  // Filter by workflowCategory
  if (req.query.workflowCategory) {
    query.workflowCategory = req.query.workflowCategory;
  }

  // Determine sort order
  let sortOrder = search ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
  if (sort) {
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDir = sort.startsWith('-') ? -1 : 1;
    sortOrder = { [sortField]: sortDir };
  }

  const prompts = await Prompt.find(query)
    .populate('creator', 'name avatar')
    .sort(sortOrder)
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

// @desc    Get prompt by MongoDB _id (admin only)
// @route   GET /api/prompts/admin/:id
// @access  Private/Admin
export const getPromptById = asyncHandler(async (req, res, next) => {
  const prompt = await Prompt.findById(req.params.id).populate('creator', 'name avatar');

  if (!prompt) {
    return next(new AppError('Prompt not found', 404));
  }

  return sendSuccess(res, prompt);
});

// @desc    Get real dashboard analytics
// @route   GET /api/prompts/admin/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const User = (await import('../models/User.js')).default;
  const Category = (await import('../models/Category.js')).default;
  const AIModel = (await import('../models/AIModel.js')).default;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalPrompts,
    totalUsers,
    totalCategories,
    totalAIModels,
    totalVisuals,
    totalWorkflows,
    likesAgg,
    copiesAgg,
    viewsAgg,
    todayPrompts,
    todayUsers,
  ] = await Promise.all([
    Prompt.countDocuments(),
    User.countDocuments(),
    Category.countDocuments(),
    AIModel.countDocuments(),
    Prompt.countDocuments({
      $or: [{ promptType: 'visual' }, { promptType: { $exists: false } }, { promptType: null }],
    }),
    Prompt.countDocuments({ promptType: 'workflow' }),
    Prompt.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }]),
    Prompt.aggregate([{ $group: { _id: null, total: { $sum: '$copies' } } }]),
    Prompt.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Prompt.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: today } }),
  ]);

  return sendSuccess(res, {
    totalPrompts,
    totalUsers,
    totalCategories,
    totalAIModels,
    totalVisuals,
    totalWorkflows,
    totalLikes: likesAgg[0]?.total ?? 0,
    totalCopies: copiesAgg[0]?.total ?? 0,
    totalViews: viewsAgg[0]?.total ?? 0,
    todayPrompts,
    todayUsers,
  });
});

// @desc    Update prompt
// @route   PUT /api/prompts/:id
// @access  Private/Admin
export const updatePrompt = asyncHandler(async (req, res, next) => {
  let prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    return next(new AppError('Prompt not found', 404));
  }

  // If promptType is missing in the update and not in the original, default to visual
  const updateData = { ...req.body };
  if (!updateData.promptType && !prompt.promptType) {
    updateData.promptType = 'visual';
  }

  prompt = await Prompt.findByIdAndUpdate(req.params.id, updateData, {
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

// @desc    Toggle like on prompt
// @route   POST /api/prompts/:id/like
// @access  Private
export const toggleLike = asyncHandler(async (req, res, next) => {
  const prompt = await Prompt.findById(req.params.id);
  const user = req.user;

  if (!prompt) {
    return next(new AppError('Prompt not found', 404));
  }

  const promptIdStr = prompt._id.toString();
  const index = user.likedPrompts.indexOf(promptIdStr);

  if (index !== -1) {
    // Un-like
    user.likedPrompts.splice(index, 1);
    prompt.likes = Math.max(0, prompt.likes - 1);
    prompt.likesCount = prompt.likes;
  } else {
    // Like
    user.likedPrompts.push(promptIdStr);
    prompt.likes += 1;
    prompt.likesCount = prompt.likes;
  }

  await user.save({ validateBeforeSave: false });
  await prompt.save({ validateBeforeSave: false });

  return sendSuccess(res, { 
    liked: index === -1,
    likesCount: prompt.likes,
    likedPrompts: user.likedPrompts 
  });
});

// @desc    Toggle save on prompt
// @route   POST /api/prompts/:id/save
// @access  Private
export const toggleSave = asyncHandler(async (req, res, next) => {
  const prompt = await Prompt.findById(req.params.id);
  const user = req.user;

  if (!prompt) {
    return next(new AppError('Prompt not found', 404));
  }

  const promptIdStr = prompt._id.toString();
  const index = user.savedPrompts.indexOf(promptIdStr);

  if (index !== -1) {
    // Un-save
    user.savedPrompts.splice(index, 1);
  } else {
    // Save
    user.savedPrompts.push(promptIdStr);
  }

  await user.save({ validateBeforeSave: false });

  return sendSuccess(res, { 
    saved: index === -1,
    savedPrompts: user.savedPrompts 
  });
});

// @desc    Get saved prompts for user
// @route   GET /api/prompts/user/saved
// @access  Private
export const getSavedPrompts = asyncHandler(async (req, res, next) => {
  const prompts = await Prompt.find({ _id: { $in: req.user.savedPrompts } })
    .populate('creator', 'name avatar')
    .sort({ createdAt: -1 });
  
  return sendSuccess(res, { prompts });
});

// @desc    Get liked prompts for user
// @route   GET /api/prompts/user/liked
// @access  Private
export const getLikedPrompts = asyncHandler(async (req, res, next) => {
  const prompts = await Prompt.find({ _id: { $in: req.user.likedPrompts } })
    .populate('creator', 'name avatar')
    .sort({ createdAt: -1 });
  
  return sendSuccess(res, { prompts });
});

// @desc    Track copy/remix of prompt
// @route   POST /api/prompts/:id/copy
// @access  Public
export const trackCopy = asyncHandler(async (req, res, next) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    return next(new AppError('Prompt not found', 404));
  }

  prompt.copies += 1;
  await prompt.save({ validateBeforeSave: false });

  return sendSuccess(res, { copies: prompt.copies });
});
