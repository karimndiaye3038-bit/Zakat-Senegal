import Transaction from '../models/Transaction.js';
import Receipt from '../models/Receipt.js';
import { env } from '../config/env.js';
import { STAFF_ROLES } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { audit } from '../utils/audit.js';
import { getZakatSettings } from '../services/settings.service.js';
import { initializePayment, handleProviderEvent, verifySignature, signPayload } from '../services/payment.service.js';
import { webhookSchema } from '../validators/payment.validator.js';

export const initialize = asyncHandler(async (req, res) => {
  const settings = await getZakatSettings();
  if (req.body.amount < settings.data.minDonation) {
    throw new ApiError(400, `Montant minimum : ${settings.data.minDonation} FCFA.`);
  }
  const { transaction, redirectPath } = await initializePayment(req.user, req.body);
  await audit(req, 'payment.initialize', `transaction:${transaction.reference}`);
  res.status(201).json({ transaction, redirectPath });
});

// Webhook prestataire : signature vérifiée sur le corps BRUT, puis idempotence.
export const webhook = asyncHandler(async (req, res) => {
  if (!verifySignature(req.rawBody, req.headers['x-signature'])) {
    await audit({ ip: req.ip }, 'payment.webhook', 'signature', 'failure');
    throw new ApiError(401, 'Signature invalide.');
  }
  const event = webhookSchema.parse(req.body);
  const out = await handleProviderEvent(event);
  res.json({ received: true, duplicate: !!out.duplicate });
});

// Simulation du prestataire (sandbox uniquement) : génère un webhook signé et le traite comme en production.
export const sandboxComplete = asyncHandler(async (req, res) => {
  if (env.paymentMode !== 'sandbox') throw new ApiError(404, 'Ressource introuvable.');
  const tx = await Transaction.findOne({ reference: req.params.reference, user: req.user._id });
  if (!tx) throw new ApiError(404, 'Transaction introuvable.');
  const payload = {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    reference: tx.reference,
    status: req.body.outcome,
    providerRef: tx.providerRef,
    reason: req.body.outcome === 'failed' ? 'Paiement refusé (simulation)' : undefined,
  };
  const raw = Buffer.from(JSON.stringify(payload));
  if (!verifySignature(raw, signPayload(raw))) throw new ApiError(500, 'Signature interne invalide.');
  const { tx: updated } = await handleProviderEvent(payload);
  res.json({ transaction: updated });
});

export const myTransactions = asyncHandler(async (req, res) => {
  const items = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200);
  res.json({ items });
});

export const getByReference = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ reference: req.params.reference });
  if (!tx || (String(tx.user) !== String(req.user._id) && !STAFF_ROLES.includes(req.user.role))) {
    throw new ApiError(404, 'Transaction introuvable.');
  }
  res.json({ transaction: tx });
});

export const getReceipt = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ reference: req.params.reference });
  const isOwner = tx && String(tx.user) === String(req.user._id);
  if (!tx || (!isOwner && !['admin', 'super_admin'].includes(req.user.role))) throw new ApiError(404, 'Reçu introuvable.');
  const receipt = await Receipt.findOne({ transaction: tx._id }).populate('user', 'name email phone');
  if (!receipt) throw new ApiError(404, "Aucun reçu : le paiement n'est pas confirmé.");
  res.json({ receipt });
});
