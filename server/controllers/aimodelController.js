import AIModel from '../models/AIModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAIModels = asyncHandler(async (req, res, next) => {
  const aiModels = await AIModel.find().sort({ name: 1 });
  sendSuccess(res, { aiModels });
});

export const createAIModel = asyncHandler(async (req, res, next) => {
  const aiModel = await AIModel.create(req.body);
  sendSuccess(res, { aiModel }, 201);
});

export const updateAIModel = asyncHandler(async (req, res, next) => {
  const aiModel = await AIModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!aiModel) {
    return next(new AppError('No AI model found with that ID', 404));
  }

  sendSuccess(res, { aiModel });
});

export const deleteAIModel = asyncHandler(async (req, res, next) => {
  const aiModel = await AIModel.findByIdAndDelete(req.params.id);

  if (!aiModel) {
    return next(new AppError('No AI model found with that ID', 404));
  }

  sendSuccess(res, null, 204);
});
