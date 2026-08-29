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
    budget: { type: mongoose.Schema.Types.Mixed },
    deadline: { type: String, default: '' },
    posted: { type: String, default: '' },
    client_email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed'],
      default: 'open',
    },
    deliverable_url: { type: String, default: '' },
    client: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
