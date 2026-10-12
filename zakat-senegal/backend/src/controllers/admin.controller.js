import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import AidRequest from '../models/AidRequest.js';
import AuditLog from '../models/AuditLog.js';
import ContactMessage from '../models/ContactMessage.js';
import { ROLES } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { audit } from '../utils/audit.js';
import { getPagination, pageMeta } from '../utils/pagination.js';
import { getBalances, getMonthlySeries, getAidBreakdown } from '../services/stats.service.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const dashboard = asyncHandler(async (req, res) => {
  const [balances, series, breakdown, pending, beneficiaries, recent] = await Promise.all([
    getBalances(),
    getMonthlySeries(6),
    getAidBreakdown(),
    AidRequest.countDocuments({ status: { $in: ['soumis', 'en_verification', 'a_completer'] } }),
    AidRequest.countDocuments({ status: { $in: ['distribuee', 'cloturee'] } }),
    Transaction.find().populate('user', 'name').sort({ createdAt: -1 }).limit(8),
  ]);
  res.json({ balances, series, breakdown, pending, beneficiaries, recent });
});

export const listTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  ['status', 'type', 'provider'].forEach((k) => {
    if (typeof req.query[k] === 'string' && req.query[k]) filter[k] = req.query[k];
  });
  const [items, total] = await Promise.all([
    Transaction.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments(filter),
  ]);
  res.json({ items, ...pageMeta(total, page, limit) });
});

// Export CSV (admin) – protégé contre l'injection de formules tableur.
export const exportTransactions = asyncHandler(async (req, res) => {
  const rows = await Transaction.find().populate('user', 'name').sort({ createdAt: -1 }).limit(10000);
  const safe = (v) => {
    const s = String(v ?? '').replace(/"/g, '""');
    return `"${/^[=+\-@]/.test(s) ? "'" + s : s}"`;
  };
  const lines = ['reference,date,donateur,type,prestataire,montant,devise,statut'];
  rows.forEach((t) =>
    lines.push([t.reference, t.createdAt.toISOString(), t.user?.name, t.type, t.provider, t.amount, t.currency, t.status].map(safe).join(','))
  );
  await audit(req, 'export.transactions', 'transactions', 'success', { count: rows.length });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.send('\ufeff' + lines.join('\n'));
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (typeof req.query.role === 'string' && req.query.role) filter.role = req.query.role;
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ items, ...pageMeta(total, page, limit) });
});

export const updateRole = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, 'Utilisateur introuvable.');
  if (String(target._id) === String(req.user._id)) throw new ApiError(400, 'Vous ne pouvez pas modifier votre propre rôle.');
  // Seul un super-administrateur peut attribuer/retirer les rôles admin et super_admin.
  const sensitive = [ROLES.ADMIN, ROLES.SUPER];
  if (req.user.role !== ROLES.SUPER && (sensitive.includes(req.body.role) || sensitive.includes(target.role))) {
    throw new ApiError(403, 'Seul un super-administrateur peut gérer les accès administrateurs.');
  }
  const before = target.role;
  target.role = req.body.role;
  await target.save();
  await audit(req, 'user.role', `user:${target._id}`, 'success', { from: before, to: target.role });
  res.json({ user: target });
});

export const updateActive = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, 'Utilisateur introuvable.');
  if (String(target._id) === String(req.user._id)) throw new ApiError(400, 'Vous ne pouvez pas désactiver votre propre compte.');
  if (req.user.role !== ROLES.SUPER && [ROLES.ADMIN, ROLES.SUPER].includes(target.role)) {
    throw new ApiError(403, 'Seul un super-administrateur peut gérer les comptes administrateurs.');
  }
  target.active = req.body.active;
  await target.save();
  await audit(req, 'user.active', `user:${target._id}`, 'success', { active: target.active });
  res.json({ user: target });
});

export const listAudit = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 30);
  const [items, total] = await Promise.all([
    AuditLog.find().populate('actor', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(),
  ]);
  res.json({ items, ...pageMeta(total, page, limit) });
});

export const listMessages = asyncHandler(async (req, res) => {
  res.json({ items: await ContactMessage.find().sort({ createdAt: -1 }).limit(100) });
});

// Message de contact public.
export const createContact = asyncHandler(async (req, res) => {
  await ContactMessage.create(req.body);
  res.status(201).json({ message: 'Message envoyé. Merci de nous avoir contactés.' });
});
