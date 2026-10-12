import Distribution from '../models/Distribution.js';
import DistributionPlan from '../models/DistributionPlan.js';
import AidRequest from '../models/AidRequest.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { audit } from '../utils/audit.js';
import { getPagination, pageMeta } from '../utils/pagination.js';
import { getBalances } from '../services/stats.service.js';
import { getZakatSettings } from '../services/settings.service.js';
import { notifyUser } from '../services/notification.service.js';
import User from '../models/User.js';

export const balances = asyncHandler(async (req, res) => res.json(await getBalances()));

export const createPlan = asyncHandler(async (req, res) => {
  const plan = await DistributionPlan.create({ ...req.body, createdBy: req.user._id });
  await audit(req, 'plan.create', `plan:${plan._id}`);
  res.status(201).json({ plan });
});

export const listPlans = asyncHandler(async (req, res) => {
  const plans = await DistributionPlan.find().sort({ createdAt: -1 }).limit(100);
  // Montant engagé par plan
  const used = await Distribution.aggregate([
    { $match: { plan: { $ne: null }, status: { $ne: 'cancelled' } } },
    { $group: { _id: '$plan', total: { $sum: '$amount' } } },
  ]);
  const map = Object.fromEntries(used.map((u) => [String(u._id), u.total]));
  res.json({ items: plans.map((p) => ({ ...p.toObject(), used: map[String(p._id)] || 0 })) });
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (typeof req.query.status === 'string' && req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Distribution.find(filter)
      .populate('aidRequest', 'reference fullName category region')
      .populate('createdBy approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Distribution.countDocuments(filter),
  ]);
  res.json({ items, ...pageMeta(total, page, limit) });
});

export const create = asyncHandler(async (req, res) => {
  const { aidRequestId, planId, fundType, amount, mode, note } = req.body;
  const request = await AidRequest.findById(aidRequestId);
  if (!request) throw new ApiError(404, 'Dossier introuvable.');
  if (!['approuve', 'en_attente_fonds'].includes(request.status)) {
    throw new ApiError(400, 'Seuls les dossiers approuvés peuvent recevoir une distribution.');
  }
  const open = await Distribution.exists({ aidRequest: request._id, status: { $in: ['pending_approval', 'planned', 'delivered'] } });
  if (open) throw new ApiError(409, 'Une distribution est déjà en cours ou réalisée pour ce dossier (contrôle des doublons).');

  // Contrôle du solde disponible pour le type de fonds choisi.
  const { byType } = await getBalances();
  if (amount > byType[fundType].available) {
    request.status = 'en_attente_fonds';
    request.history.push({ status: 'en_attente_fonds', by: req.user._id });
    await request.save();
    throw new ApiError(400, `Solde insuffisant pour le fonds « ${fundType} » (disponible : ${byType[fundType].available} FCFA). Dossier placé en attente de fonds.`);
  }

  if (planId) {
    const plan = await DistributionPlan.findById(planId);
    if (!plan) throw new ApiError(404, 'Plan de distribution introuvable.');
  }

  const settings = await getZakatSettings();
  const needsSecond = amount >= settings.data.doubleValidationThreshold;
  const distribution = await Distribution.create({
    aidRequest: request._id,
    plan: planId,
    fundType,
    amount,
    mode,
    note,
    requiresDoubleValidation: needsSecond,
    status: needsSecond ? 'pending_approval' : 'planned',
    createdBy: req.user._id,
  });
  request.status = 'aide_planifiee';
  request.history.push({ status: 'aide_planifiee', by: req.user._id });
  await request.save();
  await audit(req, 'distribution.create', `distribution:${distribution._id}`, 'success', { amount, fundType });
  res.status(201).json({ distribution });
});

// Seconde validation : doit être faite par une AUTRE personne que le créateur.
export const approve = asyncHandler(async (req, res) => {
  const d = await Distribution.findById(req.params.id);
  if (!d) throw new ApiError(404, 'Distribution introuvable.');
  if (d.status !== 'pending_approval') throw new ApiError(400, "Cette distribution n'attend pas de validation.");
  if (String(d.createdBy) === String(req.user._id)) {
    throw new ApiError(403, 'La seconde validation doit être effectuée par une autre personne que le créateur.');
  }
  d.status = 'planned';
  d.approvedBy = req.user._id;
  await d.save();
  await audit(req, 'distribution.approve', `distribution:${d._id}`);
  res.json({ distribution: d });
});

export const deliver = asyncHandler(async (req, res) => {
  const d = await Distribution.findById(req.params.id);
  if (!d) throw new ApiError(404, 'Distribution introuvable.');
  if (d.status !== 'planned') throw new ApiError(400, 'Seule une distribution validée et planifiée peut être remise.');
  d.status = 'delivered';
  d.proofRef = req.body.proofRef;
  d.deliveredAt = req.body.deliveredAt ? new Date(req.body.deliveredAt) : new Date();
  d.deliveredBy = req.user._id;
  await d.save();

  const request = await AidRequest.findById(d.aidRequest);
  if (request) {
    request.status = 'distribuee';
    request.history.push({ status: 'distribuee', by: req.user._id });
    await request.save();
    await notifyUser(await User.findById(request.applicant), 'aid_delivered', `Votre dossier ${request.reference} a été traité : consultez votre espace.`);
  }
  await audit(req, 'distribution.deliver', `distribution:${d._id}`, 'success', { proofRef: d.proofRef });
  res.json({ distribution: d });
});

// Annulation : le montant est libéré (il n'est plus compté comme engagé) et le dossier retourne en attente de fonds.
export const cancel = asyncHandler(async (req, res) => {
  const d = await Distribution.findById(req.params.id);
  if (!d) throw new ApiError(404, 'Distribution introuvable.');
  if (d.status === 'delivered') throw new ApiError(400, 'Une remise effectuée ne peut pas être annulée (créer une correction auditée).');
  if (d.status === 'cancelled') throw new ApiError(400, 'Déjà annulée.');
  d.status = 'cancelled';
  await d.save();
  await AidRequest.updateOne({ _id: d.aidRequest, status: 'aide_planifiee' }, { status: 'en_attente_fonds', $push: { history: { status: 'en_attente_fonds', by: req.user._id } } });
  await audit(req, 'distribution.cancel', `distribution:${d._id}`);
  res.json({ distribution: d });
});
