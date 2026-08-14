import express from 'express';
import { list, getOne, create, updateStatus, remove } from '../controllers/warranty.controller.js';
import { authenticate, requireEditor } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', list);
router.get('/:id', getOne);
router.post('/', requireEditor, create);
router.patch('/:id/status', requireEditor, updateStatus);
router.delete('/:id', requireEditor, remove);

export default router;