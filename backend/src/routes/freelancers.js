const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Freelancer = require('../models/Freelancer');
const cache = require('../utils/cache');

// GET /api/freelancers -> public list with search + pagination
// query: search, category, page (default 1), limit (default 9)
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', page = 1, limit = 9 } = req.query;
    const cacheKey = `freelancers:list:${search}|${category}|${page}|${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const filter = {};
    if (category) filter.categories = category;

    let list = await Freelancer.find(filter).sort({ createdAt: -1 });

    if (search) {
      const term = String(search).toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          (f.headline && f.headline.toLowerCase().includes(term)) ||
          (f.skills || []).some((s) => s.toLowerCase().includes(term))
      );
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const total = list.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const paged = list.slice(start, start + limitNum);

    const payload = {
      freelancers: paged,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    };
    cache.set(cacheKey, payload);
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
    const f = await Freelancer.findOne(query);
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
