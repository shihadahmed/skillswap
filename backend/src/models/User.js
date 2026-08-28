const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    skillsOffered: [skillSchema],
    skillsWanted: [skillSchema],
    availability: {
      type: String,
      enum: ['weekdays', 'weekends', 'evenings', 'flexible'],
      default: 'flexible',
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    swapsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
