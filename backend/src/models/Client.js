const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    company_name: { type: String, default: '' },
    headline: { type: String, default: '' },
    avatar: { type: String, default: '' },
    location: {
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    phone_number: { type: String, required: true },
    about: { type: String, default: '' },
    industry: { type: String, default: '' },
    company_size: { type: String, default: '' },
    joined_date: { type: String, default: () => new Date().toLocaleDateString('en-GB') },
    rating: { type: Number, default: 0.0 },
    reviews_count: { type: Number, default: 0 },
    total_spent: { type: String, default: '$0' },
    total_deposit: { type: String, default: '$0' },
    hire_rate: { type: String, default: '0%' },
    jobs_posted: { type: Number, default: 0 },
    active_jobs: { type: Number, default: 0 },
    verification: {
      identity_verified: { type: Boolean, default: true },
      payment_verified: { type: Boolean, default: false },
      email_verified: { type: Boolean, default: true },
      phone_verified: { type: Boolean, default: true },
    },
    activity: {
      last_active: { type: String, default: 'Just now' },
      avg_response_time: { type: String, default: 'under 1 hour' },
    },
    approval_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);