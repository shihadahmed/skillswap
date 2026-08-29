const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    freelancer_email: { type: String, required: true, lowercase: true, trim: true },
    proposed_budget: { type: Number, required: true, min: 0 },
    estimated_days: { type: Number, required: true, min: 1 },
    cover_note: { type: String, default: '' },
    deliverable_url: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Proposal', proposalSchema);
