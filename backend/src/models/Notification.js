const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_email: { type: String, required: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: [
        'task_approved',
        'task_rejected',
        'proposal_accepted',
        'payment_received',
        'review_received',
        'account_approval',
        'account_approved',
        'account_rejected',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    related_task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    related_proposal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user_email: 1, createdAt: -1 });
notificationSchema.index({ user_email: 1, is_read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);