import express from 'express';
import { list, listAll, updateUser } from '../controllers/user.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, list);
router.get('/all', authenticate, requireAdmin, listAll);
router.patch('/:id', authenticate, requireAdmin, updateUser);

export default router;
