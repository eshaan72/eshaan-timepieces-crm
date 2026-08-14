import express from 'express';
import { list, getOne, create, update, remove } from '../controllers/inventory.controller.js';
import { authenticate, requireEditor, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', list);
router.get('/:id', getOne);
router.post('/', requireAdmin, create);
router.patch('/:id', requireEditor, update);
router.delete('/:id', requireEditor, remove);

export default router;