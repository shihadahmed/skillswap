const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/explore -> list users excluding self, with optional search
router.get('/explore', auth, async (req, res) => {
  try {
    const { q, skill } = req.query;
    const filter = { _id: { $ne: req.userId } };
    if (skill) {
      filter.skills = new RegExp(skill, 'i');
    }
    let users = await User.find(filter).select('-password');
    if (q) {
      const term = q.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          (u.bio && u.bio.toLowerCase().includes(term)) ||
          (u.skills || []).some((s) => s.toLowerCase().includes(term))
      );
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id -> public profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me -> update profile (skills, bio, location, etc.)
router.put('/me', auth, async (req, res) => {
  try {
    const allowed = [
      'name', 'bio', 'image', 'skills', 'hourlyRate',
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
