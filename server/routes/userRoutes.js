import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, userController.getMe);

router.use(protect, admin);
router.get('/', userController.getAllUsers);
router.patch('/:id/role', userController.updateUserRole);

export default router;
