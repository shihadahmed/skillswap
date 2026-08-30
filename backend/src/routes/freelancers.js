const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Freelancer = require('../models/Freelancer');
const cache = require('../utils/cache');

// Only the fields the card view renders — keeps the browse payload light.
const FL_PROJECT = {
  id: 1,
  name: 1,
  headline: 1,
  badge: 1,
  avatar: 1,
  hourly_rate: 1,
  job_success_rate: 1,
  total_completed_jobs: 1,
  experience_level: 1,
  total_earned: 1,
  availability: 1,
  verification: 1,
  skills: 1,
  location: 1,
  bio: 1,
  categories: 1,
};

// GET /api/freelancers -> public list with search + server-side pagination
// query: search, category, page (default 1), limit (default 9)
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', page = 1, limit = 9, shuffle = '' } = req.query;
    // Shuffle only the default browse view (no search/category) so results
    // rotate on every reload; filtered views stay stable.
    const useShuffle = shuffle === '1' && !search && !category;
    const cacheKey = `freelancers:list:${search}|${category}|${page}|${limit}|${shuffle}`;
    if (!useShuffle) {
      const cached = cache.get(cacheKey);
      if (cached) return res.json(cached);
    }

    // Push search + category down to the database so we paginate the true
    // result set (no loading every document into memory first).
    const filter = {};
    if (category) filter.categories = category;
    if (search) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: rx }, { headline: rx }, { skills: rx }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    let paged, total;
    if (useShuffle) {
      total = await Freelancer.countDocuments(filter);
      if (total === 0) {
        paged = [];
      } else {
        const sampleSize = Math.min(total, skip + limitNum);
        paged = await Freelancer.aggregate([
          { $match: filter },
          { $sample: { size: sampleSize } },
          { $project: FL_PROJECT },
        ]);
        paged = paged.slice(skip, skip + limitNum);
      }
    } else {
      [paged, total] = await Promise.all([
        Freelancer.find(filter)
          .select(FL_PROJECT)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Freelancer.countDocuments(filter),
      ]);
    }

    const payload = {
      freelancers: paged,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    };
    if (!useShuffle) cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/freelancers/:id -> public single profile (lookup by _id or fl_ id)
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
    const f = await Freelancer.findOne(query).select(FL_PROJECT);
    if (!f) return res.status(404).json({ message: 'Freelancer not found' });
    res.json(f);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/freelancers -> add a freelancer in the rich format (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.name)
      return res.status(400).json({ message: 'name is required' });

    if (!data.id) data.id = 'fl_' + Math.random().toString(36).slice(2, 8);

    const created = await Freelancer.create(data);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
