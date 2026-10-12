import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorRole: String,
    action: { type: String, required: true, index: true },
    resource: String,
    result: { type: String, default: 'success' },
    ip: String,
    meta: mongoose.Schema.Types.Mixed, // métadonnées limitées : jamais de secrets ni de données sensibles
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('AuditLog', schema);
