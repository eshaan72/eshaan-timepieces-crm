import express from 'express';
import { upload } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, upload.single('image'), function (req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const url = '/uploads/' + req.file.filename;
  res.json({ url: url });
});

router.post('/multiple', authenticate, upload.array('images', 8), function (req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const urls = req.files.map(function (f) {
    return '/uploads/' + f.filename;
  });
  res.json({ urls: urls });
});

export default router;
