import { prisma } from '../db.js';

export async function getStats(req, res) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalCustomers,
    totalInventory,
    lowStockCount,
    pendingRepairs,
    todayOrders,
    recentCustomers,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.inventory.count(),
    prisma.inventory.count({ where: { stock: { lte: 5 } } }),
    prisma.repair.count({
      where: { status: { in: ['RECEIVED', 'IN_PROGRESS', 'WAITING_PARTS'] } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, phone: true, createdAt: true },
    }),
  ]);

  res.json({
    totalCustomers,
    totalInventory,
    lowStockCount,
    pendingRepairs,
    todayOrders,
    recentCustomers,
  });
}