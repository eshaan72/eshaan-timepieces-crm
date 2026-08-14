import { prisma } from '../db.js';
import { stripCostPrice } from '../utils/settings.js';

export async function list(req, res) {
  const search = req.query.search || '';
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const skip = (Number(page) - 1) * Number(limit);

  const where = search
    ? {
        OR: [
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const items = await prisma.inventory.findMany({
    where: where,
    skip: skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
  });
  const total = await prisma.inventory.count({ where: where });

  const stripped = items.map(function (i) {
    return stripCostPrice(i, req.user);
  });

  res.json({ items: stripped, total: total, page: Number(page), totalPages: Math.ceil(total / limit) });
}

export async function getOne(req, res) {
  const item = await prisma.inventory.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(stripCostPrice(item, req.user));
}

export async function create(req, res) {
  const data = req.body;
  const item = await prisma.inventory.create({
    data: Object.assign({}, data, {
      sellingPrice: Number(data.sellingPrice),
      costPrice: Number(data.costPrice),
      stock: Number(data.stock),
      images: data.images || [],
    }),
  });
  res.status(201).json(item);
}

export async function update(req, res) {
  const data = req.body;
  const updateData = Object.assign({}, data);
  if (data.sellingPrice) updateData.sellingPrice = Number(data.sellingPrice);
  if (data.costPrice) updateData.costPrice = Number(data.costPrice);
  if (data.stock !== undefined) updateData.stock = Number(data.stock);

  const item = await prisma.inventory.update({
    where: { id: req.params.id },
    data: updateData,
  });
  res.json(item);
}

export async function remove(req, res) {
  await prisma.inventory.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
