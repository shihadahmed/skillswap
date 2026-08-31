const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Design', 'Writing', 'Development', 'Marketing', 'Other'],
      default: 'Other',
    },
    description: { type: String, default: '' },
    budget: {
      amount: { type: Number, required: true, default: 0 },
      currency: { type: String, default: 'USD' },
      type: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    urgency: {
      type: String,
      enum: ['flexible', 'soon', 'asap'],
      default: 'flexible',
    },
    experience_level: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'intermediate',
    },
    project_type: {
      type: String,
      enum: ['one_time', 'ongoing', 'contract'],
      default: 'one_time',
    },
    estimated_duration: { type: String, default: '' },
    skills: [{ type: String, trim: true }],
    deadline: { type: String, default: '' },
    posted: { type: String, default: '' },
    client_email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'open', 'in_progress', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    proposals_count: { type: Number, default: 0 },
    deliverable_url: { type: String, default: '' },
    client: { type: mongoose.Schema.Types.Mixed },
    rejection_reason: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);