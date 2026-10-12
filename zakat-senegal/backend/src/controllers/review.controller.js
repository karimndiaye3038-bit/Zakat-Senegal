import AidRequest from '../models/AidRequest.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { AID_TRANSITIONS, REASON_REQUIRED } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { audit } from '../utils/audit.js';
import { getPagination, pageMeta } from '../utils/pagination.js';
import { notifyUser } from '../services/notification.service.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  ['status', 'category', 'region'].forEach((k) => {
    if (typeof req.query[k] === 'string' && req.query[k]) filter[k] = req.query[k];
  });
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    filter.$or = [{ reference: rx }, { fullName: rx }, { phone: rx }];
  }
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }
  const [items, total] = await Promise.all([
    AidRequest.find(filter).select('-history').sort({ createdAt: -1 }).skip(skip).limit(limit),
    AidRequest.countDocuments(filter),
  ]);
  res.json({ items, ...pageMeta(total, page, limit) });
});

export const detail = asyncHandler(async (req, res) => {
  const request = await AidRequest.findById(req.params.id).populate('applicant', 'name email phone');
  if (!request) throw new ApiError(404, 'Dossier introuvable.');
  const reviews = await Review.find({ aidRequest: request._id }).populate('agent', 'name role').sort({ createdAt: -1 });
  await audit(req, 'aid.view', `aid:${request.reference}`);
  res.json({ request, reviews, allowedTransitions: AID_TRANSITIONS[request.status] || [] });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const { status, reason, internalNote } = req.body;
  const request = await AidRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Dossier introuvable.');

  const allowed = AID_TRANSITIONS[request.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Transition « ${request.status} » → « ${status} » non autorisée.`);
  }
  if (REASON_REQUIRED.includes(status) && !reason) {
    throw new ApiError(400, 'Un motif est obligatoire pour cette décision (il sera communiqué au demandeur).');
  }

  request.status = status;
  request.publicReason = REASON_REQUIRED.includes(status) ? reason : undefined;
  request.history.push({ status, by: req.user._id });
  await request.save();
  await Review.create({ aidRequest: request._id, agent: req.user._id, decision: status, reason, internalNote });
  await audit(req, 'aid.status', `aid:${request.reference}`, 'success', { status });

  // Notification sans donnée sensible : seulement le numéro de dossier.
  const applicant = await User.findById(request.applicant);
  await notifyUser(applicant, 'aid_status', `Le statut de votre dossier ${request.reference} a changé. Connectez-vous pour le consulter.`);
  res.json({ request, allowedTransitions: AID_TRANSITIONS[status] || [] });
});
