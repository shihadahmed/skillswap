const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    client_email: { type: String, required: true, lowercase: true, trim: true },
    freelancer_email: { type: String, required: true, lowercase: true, trim: true },
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },

    // Base amounts
    base_bid_amount: { type: Number, required: true, min: 0 },

    // Freelancer side
    freelancer_fee_deducted: { type: Number, default: 0, min: 0 },
    freelancer_net_payout: { type: Number, default: 0, min: 0 },

    // Client side
    client_service_fee: { type: Number, default: 0, min: 0 },
    vat_amount: { type: Number, default: 0, min: 0 },
    gateway_fee: { type: Number, default: 0, min: 0 },
    total_paid_by_client: { type: Number, required: true, min: 0 },

    // Platform revenue
    platform_net_profit: { type: Number, default: 0, min: 0 },

    // Legacy field (for backward compatibility)
    amount: { type: Number, required: true, min: 0 },

    transaction_id: { type: String, default: '' },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paid_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
