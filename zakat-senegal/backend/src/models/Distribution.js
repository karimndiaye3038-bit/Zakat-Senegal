import mongoose from 'mongoose';
import { DISTRIBUTION_MODES, DISTRIBUTION_STATUSES, FUND_TYPES } from '../config/constants.js';

const schema = new mongoose.Schema(
  {
    aidRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'AidRequest', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'DistributionPlan' },
    fundType: { type: String, enum: FUND_TYPES, default: 'zakat' },
    amount: { type: Number, required: true, min: 1 },
    mode: { type: String, enum: DISTRIBUTION_MODES, default: 'mobile_money' },
    status: { type: String, enum: DISTRIBUTION_STATUSES, default: 'planned', index: true },
    requiresDoubleValidation: { type: Boolean, default: false },
    proofRef: String,
    deliveredAt: Date,
    note: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Distribution', schema);
