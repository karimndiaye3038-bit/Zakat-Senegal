import Transaction from '../models/Transaction.js';
import Distribution from '../models/Distribution.js';
import { FUND_TYPES } from '../config/constants.js';

const sumBy = (rows, key = '_id') => Object.fromEntries(rows.map((r) => [r[key], r.total]));

// Solde par type de fonds : collecte confirmée − distributions engagées (hors annulées).
export async function getBalances() {
  const [collected, committed, delivered] = await Promise.all([
    Transaction.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]),
    Distribution.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: '$fundType', total: { $sum: '$amount' } } }]),
    Distribution.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: '$fundType', total: { $sum: '$amount' } } }]),
  ]);
  const c = sumBy(collected);
  const m = sumBy(committed);
  const d = sumBy(delivered);
  const byType = {};
  FUND_TYPES.forEach((t) => {
    byType[t] = { collected: c[t] || 0, committed: m[t] || 0, delivered: d[t] || 0, available: (c[t] || 0) - (m[t] || 0) };
  });
  const sum = (k) => FUND_TYPES.reduce((s, t) => s + byType[t][k], 0);
  return { byType, collected: sum('collected'), delivered: sum('delivered'), available: sum('available') };
}

export async function getMonthlySeries(months = 6) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - (months - 1));
  const rows = await Transaction.aggregate([
    { $match: { status: 'confirmed', confirmedAt: { $gte: start } } },
    { $group: { _id: { y: { $year: '$confirmedAt' }, m: { $month: '$confirmedAt' } }, total: { $sum: '$amount' } } },
  ]);
  const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const series = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    const found = rows.find((r) => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1);
    series.push({ label: labels[d.getMonth()], total: found?.total || 0 });
  }
  return series;
}

export async function getAidBreakdown() {
  const rows = await Distribution.aggregate([
    { $match: { status: 'delivered' } },
    { $lookup: { from: 'aidrequests', localField: 'aidRequest', foreignField: '_id', as: 'req' } },
    { $unwind: '$req' },
    { $group: { _id: '$req.category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  return rows.map((r) => ({ category: r._id, total: r.total, count: r.count }));
}

// Statistiques publiques agrégées : AUCUNE donnée personnelle.
export async function getPublicStats() {
  const [balances, donors, beneficiaries, series, breakdown] = await Promise.all([
    getBalances(),
    Transaction.distinct('user', { status: 'confirmed' }),
    Distribution.distinct('aidRequest', { status: 'delivered' }),
    getMonthlySeries(6),
    getAidBreakdown(),
  ]);
  return {
    collected: balances.collected,
    distributed: balances.delivered,
    available: balances.available,
    byType: balances.byType,
    donors: donors.length,
    beneficiaries: beneficiaries.length,
    series,
    breakdown,
    updatedAt: new Date(),
  };
}
