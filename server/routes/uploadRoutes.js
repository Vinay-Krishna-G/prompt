import express from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, uploadMedia.single('file'), uploadController.uploadAsset);

export default router;
