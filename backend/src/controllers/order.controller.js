import { prisma } from '../db.js';

export async function list(req, res) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, phone: true } },
      items: { include: { inventory: { select: { brand: true, model: true, sku: true } } } },
    },
  });
  res.json({ items: orders });
}

export async function getOne(req, res) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: { include: { inventory: true } } },
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
}

export async function create(req, res) {
  const { customerId, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required' });
  }

  const totalAmount = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

  const order = await prisma.order.create({
    data: {
      customerId,
      userId: req.user.id,
      totalAmount,
      items: {
        create: items.map((i) => ({
          inventoryId: i.inventoryId,
          quantity: Number(i.quantity),
          price: Number(i.price),
        })),
      },
    },
    include: { items: true },
  });

  await Promise.all(
    items.map((i) =>
      prisma.inventory.update({
        where: { id: i.inventoryId },
        data: { stock: { decrement: Number(i.quantity) } },
      })
    )
  );

  res.status(201).json(order);
}

export async function updateStatus(req, res) {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json(order);
}

export async function remove(req, res) {
  await prisma.orderItem.deleteMany({ where: { orderId: req.params.id } });
  await prisma.order.delete({ where: { id: req.params.id } });
  res.status(204).send();
}