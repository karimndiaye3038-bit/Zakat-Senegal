import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // instantané : montant, type, date, statut
  },
  { timestamps: true }
);

export default mongoose.model('Receipt', schema);
