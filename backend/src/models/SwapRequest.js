const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillOffered: {
      name: { type: String, required: true },
      level: { type: String, default: 'intermediate' },
    },
    skillRequested: {
      name: { type: String, required: true },
      level: { type: String, default: 'intermediate' },
    },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
