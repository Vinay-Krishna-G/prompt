import express from 'express';
import * as promptController from '../controllers/promptController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(promptController.getPrompts)
  .post(protect, admin, promptController.createPrompt);

// User specific routes
router.get('/user/saved', protect, promptController.getSavedPrompts);
router.get('/user/liked', protect, promptController.getLikedPrompts);

router.get('/:slug', promptController.getPromptBySlug);

router
  .route('/:id')
  .put(protect, admin, promptController.updatePrompt)
  .delete(protect, admin, promptController.deletePrompt);

router.post('/:id/like', protect, promptController.toggleLike);
router.post('/:id/save', protect, promptController.toggleSave);

export default router;
