import express from 'express';
import {
  getAIModels,
  createAIModel,
  updateAIModel,
  deleteAIModel,
} from '../controllers/aimodelController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAIModels)
  .post(protect, admin, createAIModel);

router.route('/:id')
  .patch(protect, admin, updateAIModel)
  .delete(protect, admin, deleteAIModel);

export default router;
