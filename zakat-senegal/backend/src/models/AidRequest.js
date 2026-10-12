import mongoose from 'mongoose';
import { AID_CATEGORIES, AID_STATUSES, REGIONS } from '../config/constants.js';

const documentSchema = new mongoose.Schema(
  { originalName: String, filename: String, mimetype: String, size: Number },
  { _id: true }
);

const schema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true, maxlength: 250 },
    region: { type: String, enum: REGIONS, required: true },
    category: { type: String, enum: AID_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    householdSize: { type: Number, min: 1, max: 60, default: 1 },
    documents: [documentSchema],
    status: { type: String, enum: AID_STATUSES, default: 'soumis', index: true },
    publicReason: String, // motif communiqué au demandeur (jamais les notes internes)
    possibleDuplicate: { type: Boolean, default: false },
    history: [
      {
        status: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('AidRequest', schema);
