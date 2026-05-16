import express from 'express';
import * as promptController from '../controllers/promptController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(promptController.getPrompts)
  .post(protect, admin, promptController.createPrompt);

// ── Admin-only routes (must come BEFORE /:slug to avoid collision) ──
router.get('/admin/stats', protect, admin, promptController.getDashboardStats);
router.get('/admin/:id', protect, admin, promptController.getPromptById);
router.put('/admin/:id', protect, admin, promptController.updatePrompt);

// User specific routes
router.get('/user/saved', protect, promptController.getSavedPrompts);
router.get('/user/liked', protect, promptController.getLikedPrompts);

// Public slug route
router.get('/:slug', promptController.getPromptBySlug);

// Public-facing like/save toggles (require auth, not admin)
router.post('/:id/like', protect, promptController.toggleLike);
router.post('/:id/save', protect, promptController.toggleSave);
router.post('/:id/copy', promptController.trackCopy);

// Original /:id routes retained for delete (admin only)
router.delete('/:id', protect, admin, promptController.deletePrompt);

export default router;
