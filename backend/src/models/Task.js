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
    budget: { type: Number, required: true, min: 0 },
    deadline: { type: Date },
    client_email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed'],
      default: 'open',
    },
    deliverable_url: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
