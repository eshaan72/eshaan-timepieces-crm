import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getSettings);
router.patch('/', authenticate, requireAdmin, updateSettings);

export default router;
