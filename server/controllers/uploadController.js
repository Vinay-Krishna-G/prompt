import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { sendSuccess } from '../utils/apiResponse.js';

// @desc    Upload media asset (image/video)
// @route   POST /api/upload
// @access  Private/Admin
export const uploadAsset = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please provide a file to upload.', 400));
  }

  const isVideo = req.file.mimetype.startsWith('video');
  const folder = isVideo ? 'promptvault/videos' : 'promptvault/images';
  const resourceType = isVideo ? 'video' : 'image';

  try {
    const result = await uploadToCloudinary(req.file.buffer, folder, resourceType);
    
    return sendSuccess(res, {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
    });
  } catch (error) {
    return next(new AppError('Error uploading file to Cloudinary: ' + error.message, 500));
  }
});
