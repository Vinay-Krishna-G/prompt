import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { registerBodySchema, loginBodySchema } from '../validators/authValidators.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', validateBody(registerBodySchema), authController.register);
router.post('/login', validateBody(loginBodySchema), authController.login);
router.post('/verify', authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

export default router;
