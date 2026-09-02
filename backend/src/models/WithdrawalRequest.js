const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema(
  {
    freelancer_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'USD' },
    method: {
      type: String,
      enum: ['stripe_transfer', 'manual'],
      default: 'stripe_transfer',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    stripe_transfer_id: { type: String, default: '' },
    note: { type: String, default: '' },
    processed_by: { type: String, default: '' },
    processed_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
