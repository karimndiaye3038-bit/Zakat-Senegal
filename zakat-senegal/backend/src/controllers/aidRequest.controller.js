import path from 'path';
import fs from 'fs';
import AidRequest from '../models/AidRequest.js';
import { STAFF_ROLES } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { makeReference } from '../utils/generate.js';
import { audit } from '../utils/audit.js';
import { uploadRoot, removeFiles } from '../middlewares/upload.js';
import { notifyUser } from '../services/notification.service.js';
import { aidRequestSchema, resubmitSchema } from '../validators/aid.validator.js';

const toDocs = (files = []) =>
  files.map((f) => ({ originalName: f.originalname, filename: f.filename, mimetype: f.mimetype, size: f.size }));

// Vue "demandeur" : jamais de notes internes ni d'informations de vérification.
export const applicantView = (r) => ({
  id: r._id,
  reference: r.reference,
  category: r.category,
  region: r.region,
  description: r.description,
  status: r.status,
  publicReason: r.publicReason,
  documents: r.documents.map((d) => ({ id: d._id, originalName: d.originalName })),
  history: r.history.map((h) => ({ status: h.status, at: h.at })),
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

export const create = asyncHandler(async (req, res) => {
  // Validation faite ici (après multer) pour pouvoir nettoyer les fichiers en cas d'erreur.
  const parsed = aidRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    removeFiles(req.files);
    throw parsed.error;
  }
  const data = parsed.data;
  if (!req.files?.length) throw new ApiError(400, 'Ajoutez au moins une pièce justificative.');

  // Aide à la vérification (pas de décision automatique) : demande active similaire ?
  const duplicate = await AidRequest.exists({
    phone: data.phone,
    category: data.category,
    status: { $nin: ['refuse', 'cloturee', 'distribuee'] },
  });

  const request = await AidRequest.create({
    ...data,
    reference: makeReference('DOS'),
    applicant: req.user._id,
    documents: toDocs(req.files),
    possibleDuplicate: !!duplicate,
    history: [{ status: 'soumis', by: req.user._id }],
  });
  await audit(req, 'aid.create', `aid:${request.reference}`);
  await notifyUser(req.user, 'aid_received', `Demande reçue. Numéro de dossier : ${request.reference}.`);
  res.status(201).json({ request: applicantView(request) });
});

export const mine = asyncHandler(async (req, res) => {
  const items = await AidRequest.find({ applicant: req.user._id }).sort({ createdAt: -1 });
  res.json({ items: items.map(applicantView) });
});

// Le demandeur complète un dossier "à compléter".
export const resubmit = asyncHandler(async (req, res) => {
  const request = await AidRequest.findOne({ _id: req.params.id, applicant: req.user._id });
  if (!request) {
    removeFiles(req.files);
    throw new ApiError(404, 'Dossier introuvable.');
  }
  if (request.status !== 'a_completer') {
    removeFiles(req.files);
    throw new ApiError(400, "Ce dossier n'attend pas de complément.");
  }
  const parsed = resubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    removeFiles(req.files);
    throw parsed.error;
  }
  request.description += `\n\n[Complément] ${parsed.data.message}`;
  request.documents.push(...toDocs(req.files));
  request.status = 'soumis';
  request.publicReason = undefined;
  request.history.push({ status: 'soumis', by: req.user._id });
  await request.save();
  await audit(req, 'aid.resubmit', `aid:${request.reference}`);
  res.json({ request: applicantView(request) });
});

// Téléchargement protégé : demandeur propriétaire ou personnel autorisé uniquement.
export const downloadDocument = asyncHandler(async (req, res) => {
  const request = await AidRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Document introuvable.');
  const isOwner = String(request.applicant) === String(req.user._id);
  if (!isOwner && !STAFF_ROLES.includes(req.user.role)) throw new ApiError(404, 'Document introuvable.');
  const doc = request.documents.id(req.params.docId);
  if (!doc) throw new ApiError(404, 'Document introuvable.');
  const filePath = path.join(uploadRoot, path.basename(doc.filename));
  if (!fs.existsSync(filePath)) throw new ApiError(404, 'Fichier indisponible.');
  await audit(req, 'aid.document.download', `aid:${request.reference}`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.download(filePath, doc.originalName);
});
