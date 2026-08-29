const mongoose = require('mongoose');

const certSchema = new mongoose.Schema(
  {
    title: String,
    issuer: String,
    year: String,
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    project_title: String,
    live_url: String,
    role: String,
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    status: String,
    hours_per_week: String,
    response_time: String,
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    identity_verified: { type: Boolean, default: false },
    payment_verified: { type: Boolean, default: false },
    phone_verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const freelancerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    headline: { type: String, default: '' },
    badge: { type: String, default: '' },
    avatar: { type: String, default: '' },
    hourly_rate: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    location: {
      city: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    experience_level: { type: String, default: '' },
    total_earned: { type: String, default: '' },
    job_success_rate: { type: String, default: '' },
    total_completed_jobs: { type: Number, default: 0 },
    hours_billed: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    categories: [{ type: String }],
    certifications: [certSchema],
    portfolio: [portfolioSchema],
    availability: availabilitySchema,
    verification: verificationSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Freelancer', freelancerSchema);
