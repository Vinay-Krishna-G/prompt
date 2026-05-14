import express from 'express';
import * as promptController from '../controllers/promptController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(promptController.getPrompts)
  .post(protect, admin, promptController.createPrompt);

router.get('/:slug', promptController.getPromptBySlug);

router
  .route('/:id')
  .put(protect, admin, promptController.updatePrompt)
  .delete(protect, admin, promptController.deletePrompt);

export default router;
