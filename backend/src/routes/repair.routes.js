import express from 'express';
import { list, getOne, getStats, create, update, updateStatus, remove } from '../controllers/repair.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', list);
router.get('/stats', getStats);
router.get('/:id', getOne);
router.post('/', create);
router.patch('/:id', update);
router.patch('/:id/status', updateStatus);
router.delete('/:id', remove);

export default router;
