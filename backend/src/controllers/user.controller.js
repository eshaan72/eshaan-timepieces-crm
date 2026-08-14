import { prisma } from '../db.js';

export async function list(req, res) {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });
  res.json({ items: users });
}

export async function listAll(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      contactAccess: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });
  res.json({ items: users });
}

const VALID_ROLES = ['ADMIN', 'SALES', 'ONLY_VIEW'];
const VALID_CONTACT_ACCESS = ['FULL', 'PARTIAL', 'HIDDEN'];

export async function updateUser(req, res) {
  const id = req.params.id;
  const role = req.body.role;
  const isActive = req.body.isActive;
  const contactAccess = req.body.contactAccess;

  if (id === req.user.id && isActive === false) {
    return res.status(400).json({ error: 'You cannot deactivate your own account' });
  }

  const data = {};
  if (role !== undefined) {
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role value' });
    }
    data.role = role;
  }
  if (isActive !== undefined) {
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'Invalid active status value' });
    }
    data.isActive = isActive;
  }
  if (contactAccess !== undefined) {
    if (!VALID_CONTACT_ACCESS.includes(contactAccess)) {
      return res.status(400).json({ error: 'Invalid contact access value' });
    }
    data.contactAccess = contactAccess;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: id },
      data: data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        contactAccess: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('User update failed:', error);
    return res.status(500).json({ error: 'Unable to update user' });
  }
}
