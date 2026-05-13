import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/', userController.getAllUsers);

export default router;
