import mongoose from 'mongoose';
import { FUND_TYPES } from '../config/constants.js';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    fundType: { type: String, enum: FUND_TYPES, default: 'zakat' },
    category: String,
    zone: String,
    budget: { type: Number, required: true, min: 0 },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('DistributionPlan', schema);
