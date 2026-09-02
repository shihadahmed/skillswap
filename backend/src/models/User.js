const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    image: { type: String, default: '' },
    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin'],
      default: 'client',
    },
    isProfileComplete: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    skills: [{ type: String, trim: true }],
    bio: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    jobsCompleted: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0, min: 0 },
    available_balance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
