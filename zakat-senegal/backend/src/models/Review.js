import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    aidRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'AidRequest', required: true, index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    decision: { type: String, required: true }, // nouveau statut
    reason: String, // visible par le demandeur
    internalNote: String, // réservé au personnel
  },
  { timestamps: true }
);

export default mongoose.model('Review', schema);
