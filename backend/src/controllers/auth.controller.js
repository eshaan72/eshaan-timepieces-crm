import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { generateToken } from '../utils/jwt.js';

export async function register(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;

  const existing = await prisma.user.findUnique({ where: { email: email } });
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name, email: email, passwordHash: passwordHash, role: role || 'SALES' },
  });

  const token = generateToken(user);
  res.cookie('accessToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({ error: 'Account is deactivated' });
  }

  const token = generateToken(user);
  res.cookie('accessToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function me(req, res) {
  const user = req.user;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      contactAccess: user.contactAccess,
    },
  });
}

export async function logout(req, res) {
  res.clearCookie('accessToken');
  res.json({ message: 'Logged out' });
}

export async function changePassword(req, res) {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash: newHash },
  });

  res.json({ message: 'Password updated successfully' });
}
