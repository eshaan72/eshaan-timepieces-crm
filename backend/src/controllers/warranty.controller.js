import { prisma } from '../db.js';

export async function list(req, res) {
  const warranties = await prisma.warranty.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, phone: true } },
      inventory: { select: { brand: true, model: true, sku: true } },
    },
  });
  res.json({ items: warranties });
}

export async function getOne(req, res) {
  const warranty = await prisma.warranty.findUnique({
    where: { id: req.params.id },
    include: { customer: true, inventory: true, order: true },
  });
  if (!warranty) return res.status(404).json({ error: 'Not found' });
  res.json(warranty);
}

export async function create(req, res) {
  const { customerId, inventoryId, orderId, startDate, endDate, terms } = req.body;

  const warranty = await prisma.warranty.create({
    data: {
      customerId,
      inventoryId,
      orderId: orderId || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      terms: terms || null,
    },
  });

  res.status(201).json(warranty);
}

export async function updateStatus(req, res) {
  const warranty = await prisma.warranty.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json(warranty);
}

export async function remove(req, res) {
  await prisma.warranty.delete({ where: { id: req.params.id } });
  res.status(204).send();
}