import { prisma } from '../db.js';
import { maskCustomer } from '../utils/settings.js';

export async function list(req, res) {
  const search = req.query.search || '';
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const skip = (Number(page) - 1) * Number(limit);

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const items = await prisma.customer.findMany({
    where: where,
    skip: skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
  });
  const total = await prisma.customer.count({ where: where });

  const masked = items.map(function (c) {
    return maskCustomer(c, req.user);
  });

  res.json({ items: masked, total: total, page: Number(page), totalPages: Math.ceil(total / limit) });
}

export async function getOne(req, res) {
  const item = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      orders: true,
      repairs: true,
      warranties: true,
    },
  });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(maskCustomer(item, req.user));
}

export async function create(req, res) {
  const item = await prisma.customer.create({ data: req.body });
  res.status(201).json(item);
}

export async function update(req, res) {
  const item = await prisma.customer.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(item);
}

export async function remove(req, res) {
  await prisma.customer.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
