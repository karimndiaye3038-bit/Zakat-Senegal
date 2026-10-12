import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import Receipt from '../models/Receipt.js';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { makeReference } from '../utils/generate.js';
import { notifyUser } from './notification.service.js';

/* ---------- Signature des webhooks (HMAC-SHA256) ---------- */
export const signPayload = (raw) => crypto.createHmac('sha256', env.webhookSecret).update(raw).digest('hex');

export function verifySignature(raw, signature = '') {
  if (!raw || !signature) return false;
  const expected = Buffer.from(signPayload(raw));
  const received = Buffer.from(String(signature));
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

/* ---------- Prestataires ---------- */
// Mode "sandbox" : simulation locale. Mode "live" : à implémenter avec l'API officielle
// de chaque prestataire APRÈS accord formel (Wave, Orange Money, carte bancaire).
const sandboxProvider = {
  async initialize(tx) {
    return { providerRef: `SBX-${tx.reference}`, redirectPath: `/paiement/sandbox/${tx.reference}` };
  },
};
const notConfigured = (name) => ({
  async initialize() {
    throw new ApiError(501, `Le moyen de paiement « ${name} » n'est pas encore activé (accord prestataire requis).`);
  },
});
const liveProviders = {
  wave: notConfigured('Wave'),
  orange_money: notConfigured('Orange Money'),
  card: notConfigured('Carte bancaire'),
};
const getProvider = (method) => (env.paymentMode === 'sandbox' ? sandboxProvider : liveProviders[method]);

export async function initializePayment(user, { amount, type, method }) {
  const tx = await Transaction.create({
    reference: makeReference('TX'),
    user: user._id,
    amount,
    type,
    provider: method,
    status: 'initiated',
  });
  try {
    const { providerRef, redirectPath } = await getProvider(method).initialize(tx);
    tx.providerRef = providerRef;
    tx.status = 'pending';
    await tx.save();
    return { transaction: tx, redirectPath };
  } catch (err) {
    tx.status = 'failed';
    tx.failureReason = err.message;
    await tx.save();
    throw err;
  }
}

/* ---------- Traitement d'un événement prestataire (webhook) ---------- */
// Seule porte d'entrée pour confirmer un paiement : jamais depuis le navigateur.
export async function handleProviderEvent(event) {
  const tx = await Transaction.findOne({ reference: event.reference });
  if (!tx) throw new ApiError(404, 'Transaction inconnue.');

  // Idempotence : un événement déjà traité est ignoré.
  if (tx.processedEvents.includes(event.eventId)) return { tx, duplicate: true };
  tx.processedEvents.push(event.eventId);

  // Un paiement confirmé ou remboursé ne peut plus être rétrogradé.
  if (['confirmed', 'refunded'].includes(tx.status)) {
    await tx.save();
    return { tx, ignored: true };
  }

  if (event.providerRef) tx.providerRef = event.providerRef;
  if (event.status === 'success') {
    tx.status = 'confirmed';
    tx.confirmedAt = new Date();
    await tx.save();
    await createReceipt(tx);
    const user = await User.findById(tx.user);
    await notifyUser(user, 'payment_confirmed', `Merci ! Votre don de ${tx.amount} FCFA (réf. ${tx.reference}) est confirmé.`);
  } else {
    tx.status = event.status === 'cancelled' ? 'cancelled' : 'failed';
    tx.failureReason = event.reason;
    await tx.save();
  }
  return { tx };
}

async function createReceipt(tx) {
  const exists = await Receipt.findOne({ transaction: tx._id });
  if (exists) return exists;
  return Receipt.create({
    number: makeReference('REC'),
    transaction: tx._id,
    user: tx.user,
    data: {
      reference: tx.reference,
      amount: tx.amount,
      currency: tx.currency,
      type: tx.type,
      provider: tx.provider,
      status: 'confirmed',
      date: tx.confirmedAt,
    },
  });
}
