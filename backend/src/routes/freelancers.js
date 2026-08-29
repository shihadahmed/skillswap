const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Freelancer = require('../models/Freelancer');
const cache = require('../utils/cache');

// GET /api/freelancers -> public list with search + pagination
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

    const filter = {};
    if (category) filter.categories = category;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    let raw, total;
    if (useShuffle) {
      total = await Freelancer.countDocuments(filter);
      if (total === 0) {
        raw = [];
      } else {
        const sampleSize = Math.min(total, skip + limitNum);
        raw = await Freelancer.aggregate([
          { $match: filter },
          { $sample: { size: sampleSize } },
        ]);
      }
    } else {
      raw = await Freelancer.find(filter).sort({ createdAt: -1 });
      total = raw.length;
    }

    // Search filter (name / headline / skills) — applied only when a term exists.
    let list = raw;
    if (search) {
      const term = String(search).toLowerCase();
      list = raw.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          (f.headline && f.headline.toLowerCase().includes(term)) ||
          (f.skills || []).some((s) => s.toLowerCase().includes(term))
      );
      total = list.length;
    }

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
