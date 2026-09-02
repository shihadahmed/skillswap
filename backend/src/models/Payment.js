const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    client_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    freelancer_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },

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

    // Legacy field (for backward compatibility with old dummy rows)
    amount: { type: Number, required: true, min: 0 },

    currency: { type: String, default: 'USD' },

    transaction_id: { type: String, default: '', index: true },
    payment_status: {
      type: String,
      enum: [
        'pending',
        'paid',
        'escrow_locked',
        'released',
        'refunded',
        'completed',
        'failed',
      ],
      default: 'pending',
      index: true,
    },
    payment_type: {
      type: String,
      enum: ['task_deposit', 'freelancer_withdraw'],
      default: 'task_deposit',
      index: true,
    },
    paid_at: { type: Date },
    released_at: { type: Date },
    refunded_at: { type: Date },

    // Stripe-specific metadata
    stripe_session_id: { type: String, default: '', index: true },
    stripe_payment_intent: { type: String, default: '' },
    stripe_charge_id: { type: String, default: '' },
    stripe_transfer_id: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
