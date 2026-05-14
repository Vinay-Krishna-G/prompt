import multer from 'multer';
import AppError from '../utils/AppError.js';

const storage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Not an allowed file type! Please upload only jpeg, jpg, png, webp, mp4 or webm.', 400), false);
  }
};

export const uploadMedia = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit to handle videos
  },
});
