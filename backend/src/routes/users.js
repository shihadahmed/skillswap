const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/explore -> list users excluding self, with optional search + pagination
router.get('/explore', auth, async (req, res) => {
  try {
    const { q, skill, page = 1, limit = 9 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const filter = { _id: { $ne: req.userId } };
    if (skill) filter.skills = new RegExp(skill, 'i');
    if (q) {
      const rx = new RegExp(q.trim(), 'i');
      filter.$or = [{ name: rx }, { bio: rx }, { skills: rx }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email image role skills bio rating jobsCompleted createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);
    res.json({
      users,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
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
