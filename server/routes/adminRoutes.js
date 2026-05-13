import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', adminController.getDashboardStats);

export default router;
