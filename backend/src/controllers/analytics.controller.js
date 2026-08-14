import { prisma } from '../db.js';

export async function getAnalytics(req, res) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    allOrders,
    monthOrders,
    recentOrders,
    orderItems,
    repairs,
    inventoryItems,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
    }),
    prisma.orderItem.findMany({
      include: { inventory: { select: { brand: true, model: true } } },
    }),
    prisma.repair.groupBy({ by: ['status'], _count: true }),
    prisma.inventory.findMany({ select: { costPrice: true, sellingPrice: true, stock: true } }),
  ]);

  const monthlyRevenue = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthlyRevenue[key] = 0;
  }
  recentOrders.forEach((o) => {
    const key = new Date(o.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (monthlyRevenue[key] !== undefined) {
      monthlyRevenue[key] += Number(o.totalAmount);
    }
  });

  const salesByItem = {};
  orderItems.forEach((oi) => {
    const key = oi.inventory.brand + ' ' + oi.inventory.model;
    salesByItem[key] = (salesByItem[key] || 0) + oi.quantity;
  });
  const topSelling = Object.entries(salesByItem)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const inventoryValue = inventoryItems.reduce(
    (acc, i) => {
      acc.costValue += Number(i.costPrice) * i.stock;
      acc.sellingValue += Number(i.sellingPrice) * i.stock;
      return acc;
    },
    { costValue: 0, sellingValue: 0 }
  );

  res.json({
    totalRevenue: Number(allOrders._sum.totalAmount || 0),
    monthRevenue: Number(monthOrders._sum.totalAmount || 0),
    monthlyRevenue: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount })),
    topSelling,
    repairsByStatus: repairs.map((r) => ({ status: r.status, count: r._count })),
    inventoryValue,
  });
}