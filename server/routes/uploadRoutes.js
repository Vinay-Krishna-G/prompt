import express from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, uploadController.uploadAsset);

export default router;
