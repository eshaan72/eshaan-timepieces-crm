import { prisma } from '../db.js';

export async function list(req, res) {
  const repairs = await prisma.repair.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, phone: true } },
      inventory: { select: { brand: true, model: true } },
      technician: { select: { name: true } },
    },
  });
  res.json({ items: repairs });
}

export async function getOne(req, res) {
  const repair = await prisma.repair.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      inventory: true,
      technician: true,
      timeline: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!repair) return res.status(404).json({ error: 'Not found' });
  res.json(repair);
}

export async function getStats(req, res) {
  const [statusCounts, byTechnician, completedJobs] = await Promise.all([
    prisma.repair.groupBy({ by: ['status'], _count: true }),
    prisma.repair.groupBy({
      by: ['technicianId'],
      _count: true,
      where: { technicianId: { not: null } },
    }),
    prisma.repair.findMany({
      where: { status: 'DELIVERED', deliveryDate: { not: null } },
      select: { createdAt: true, deliveryDate: true },
    }),
  ]);

  const technicianIds = byTechnician.map(function (t) { return t.technicianId; });
  const technicians = await prisma.user.findMany({
    where: { id: { in: technicianIds } },
    select: { id: true, name: true },
  });
  const techMap = {};
  technicians.forEach(function (t) { techMap[t.id] = t.name; });

  const technicianWorkload = byTechnician.map(function (t) {
    return { technicianId: t.technicianId, name: techMap[t.technicianId] || 'Unknown', count: t._count };
  });

  let avgTurnaroundDays = 0;
  if (completedJobs.length > 0) {
    const totalDays = completedJobs.reduce(function (sum, j) {
      const diffMs = new Date(j.deliveryDate) - new Date(j.createdAt);
      return sum + diffMs / (1000 * 60 * 60 * 24);
    }, 0);
    avgTurnaroundDays = Math.round((totalDays / completedJobs.length) * 10) / 10;
  }

  res.json({
    statusCounts: statusCounts.map(function (s) { return { status: s.status, count: s._count }; }),
    technicianWorkload: technicianWorkload,
    avgTurnaroundDays: avgTurnaroundDays,
    totalJobs: statusCounts.reduce(function (sum, s) { return sum + s._count; }, 0),
  });
}

export async function create(req, res) {
  const body = req.body;

  const repair = await prisma.repair.create({
    data: {
      customerId: body.customerId,
      inventoryId: body.inventoryId || null,
      technicianId: body.technicianId || null,
      pickupDate: body.pickupDate ? new Date(body.pickupDate) : null,
      notes: body.notes || null,
      externalWatchBrand: body.externalWatchBrand || null,
      externalWatchModel: body.externalWatchModel || null,
      externalWatchSerial: body.externalWatchSerial || null,
      images: body.images || [],
      timeline: {
        create: {
          status: 'RECEIVED',
          note: 'Repair job created and item received.',
        },
      },
    },
    include: { timeline: true },
  });

  res.status(201).json(repair);
}

export async function update(req, res) {
  const body = req.body;
  const updateData = {};

  if (body.technicianId !== undefined) updateData.technicianId = body.technicianId || null;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.images !== undefined) updateData.images = body.images;
  if (body.externalWatchBrand !== undefined) updateData.externalWatchBrand = body.externalWatchBrand;
  if (body.externalWatchModel !== undefined) updateData.externalWatchModel = body.externalWatchModel;
  if (body.externalWatchSerial !== undefined) updateData.externalWatchSerial = body.externalWatchSerial;

  const repair = await prisma.repair.update({
    where: { id: req.params.id },
    data: updateData,
    include: {
      customer: { select: { name: true, phone: true } },
      inventory: { select: { brand: true, model: true } },
      technician: { select: { name: true } },
    },
  });

  res.json(repair);
}

export async function updateStatus(req, res) {
  const status = req.body.status;
  const note = req.body.note;

  const data = { status: status };
  if (status === 'DELIVERED') {
    data.deliveryDate = new Date();
  }

  const repair = await prisma.repair.update({
    where: { id: req.params.id },
    data: Object.assign({}, data, {
      timeline: {
        create: {
          status: status,
          note: note || ('Status updated to ' + status),
        },
      },
    }),
    include: { timeline: { orderBy: { createdAt: 'asc' } } },
  });

  res.json(repair);
}

export async function remove(req, res) {
  await prisma.repairTimeline.deleteMany({ where: { repairId: req.params.id } });
  await prisma.repair.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
