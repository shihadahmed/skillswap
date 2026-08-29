const router = require('express').Router();
const auth = require('../middleware/auth');
const Freelancer = require('../models/Freelancer');

// GET /api/freelancers -> public list with search + pagination
// query: search, category, page (default 1), limit (default 9)
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', page = 1, limit = 9 } = req.query;
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

    res.json({
      freelancers: paged,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/freelancers/:id -> public single profile
router.get('/:id', async (req, res) => {
  try {
    const f = await Freelancer.findOne({ id: req.params.id });
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
