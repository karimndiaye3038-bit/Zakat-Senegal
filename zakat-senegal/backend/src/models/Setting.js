import mongoose from 'mongoose';

// Paramètres versionnés : chaque modification crée une nouvelle version (historique conservé).
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, index: true }, // ex. "zakat"
    version: { type: Number, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    effectiveDate: { type: Date, default: Date.now },
    validated: { type: Boolean, default: false },
    validatedBy: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
settingSchema.index({ key: 1, version: -1 }, { unique: true });

export default mongoose.model('Setting', settingSchema);
