import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export async function authenticate(req, res, next) {
  const token = req.cookies ? req.cookies.accessToken : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Account not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export function requireEditor(req, res, next) {
  if (req.user.role === 'ONLY_VIEW') {
    return res.status(403).json({ error: 'Editor access required' });
  }
  next();
}
