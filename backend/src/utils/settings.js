import { prisma } from '../db.js';

const DEFAULTS = {
  lowStockThreshold: '5',
  companyName: 'Eshaan Timepieces',
  currency: 'USD',
  appVersion: '1.0.0',
};

export async function getSetting(key) {
  const row = await prisma.setting.findUnique({ where: { key: key } });
  if (row) return row.value;
  return DEFAULTS[key] !== undefined ? DEFAULTS[key] : null;
}

export async function getAllSettings() {
  const rows = await prisma.setting.findMany();
  const result = {};
  for (const key in DEFAULTS) {
    result[key] = DEFAULTS[key];
  }
  rows.forEach(function (r) {
    result[r.key] = r.value;
  });
  return result;
}

export async function setSetting(key, value) {
  return prisma.setting.upsert({
    where: { key: key },
    update: { value: String(value) },
    create: { key: key, value: String(value), group: 'app' },
  });
}

export function maskCustomer(customer, requester) {
  if (!customer) return customer;
  const access = requester.role === 'ADMIN' ? 'FULL' : requester.contactAccess;

  const result = Object.assign({}, customer);

  if (access === 'FULL') {
    return result;
  }

  if (access === 'PARTIAL') {
    if (result.phone) {
      result.phone = maskPhonePartial(result.phone);
    }
    if (result.whatsapp) {
      result.whatsapp = maskPhonePartial(result.whatsapp);
    }
    result.email = result.email ? 'Hidden' : result.email;
    result.address = result.address ? 'Hidden' : result.address;
    return result;
  }

  result.phone = result.phone ? null : result.phone;
  result.whatsapp = result.whatsapp ? null : result.whatsapp;
  result.email = result.email ? null : result.email;
  result.address = result.address ? null : result.address;
  return result;
}

function maskPhonePartial(phone) {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length <= 6) return '******';
  const start = digits.slice(0, 3);
  const end = digits.slice(-4);
  return start + '***' + end;
}

export function stripCostPrice(item, requester) {
  if (!item) return item;
  if (requester.role === 'ADMIN') return item;
  const result = Object.assign({}, item);
  delete result.costPrice;
  return result;
}
