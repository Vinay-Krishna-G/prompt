import express from 'express';
import * as promptController from '../controllers/promptController.js';
const router = express.Router();

router.get('/', promptController.getAllPrompts);

export default router;
