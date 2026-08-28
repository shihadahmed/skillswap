const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    client_email: { type: String, required: true, lowercase: true, trim: true },
    freelancer_email: { type: String, required: true, lowercase: true, trim: true },
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
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
