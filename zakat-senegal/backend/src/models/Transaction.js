import mongoose from 'mongoose';
import { FUND_TYPES, PAYMENT_METHODS, TX_STATUSES } from '../config/constants.js';

const schema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'XOF' },
    type: { type: String, enum: FUND_TYPES, required: true },
    provider: { type: String, enum: PAYMENT_METHODS, required: true },
    providerRef: String,
    status: { type: String, enum: TX_STATUSES, default: 'initiated', index: true },
    processedEvents: { type: [String], default: [] }, // idempotence des webhooks
    confirmedAt: Date,
    failureReason: String,
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', schema);
