import mongoose from 'mongoose';

// Journal des notifications envoyées (et des échecs de livraison).
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    channel: { type: String, enum: ['email', 'sms'], required: true },
    to: String,
    type: String,
    message: String,
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    error: String,
  },
  { timestamps: true }
);

export default mongoose.model('Notification', schema);
