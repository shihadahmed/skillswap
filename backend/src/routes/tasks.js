const router = require('express').Router();
const Task = require('../models/Task');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireRole, optionalAuth } = auth;
const cache = require('../utils/cache');

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];

const clientView = (u) =>
  u ? { name: u.name, image: u.image, email: u.email } : null;

// Attach a client object to each task. The seeded/real data already embeds a
// rich `client`, so we preserve it; otherwise we leave the document as-is.
async function attachClients(tasks) {
  return tasks.map((t) => (t.toObject ? t.toObject() : t));
}

// Attach a proposals_count to each task based on its proposals.
// Match is type-agnostic: task_id may be stored as an ObjectId or a String
// in the proposals collection, so we match both forms.
async function withProposalCounts(tasks) {
  if (!tasks.length) return tasks;
  const objIds = tasks.map((t) => t._id);
  const strIds = tasks.map((t) => t._id.toString());
  const counts = await Proposal.aggregate([
    {
      $match: {
        $or: [
          { task_id: { $in: objIds } },
          { task_id: { $in: strIds } },
        ],
      },
    },
    { $group: { _id: { $toString: '$task_id' }, n: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [c._id, c.n]));
  return tasks.map((t) => {
    const obj = t.toObject ? t.toObject() : t;
    const key = t._id.toString();
    const dynamic = map.get(key) || 0;
    const stored = obj.proposals_count;
    // Prefer a real stored proposals_count (seed/demo data); only fall back to
    // the live proposal count when the field is absent.
    const proposals_count = typeof stored === 'number' ? stored : dynamic;
    return { ...obj, proposals_count };
  });
}

// GET /api/tasks — public browse with search, category filter, pagination
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', page = 1, limit = 9, shuffle = '' } = req.query;
    // Shuffle only applies to the default browse view (no search/category) so
    // results rotate on every reload, while filtered views stay stable.
    const useShuffle = shuffle === '1' && !search && !category;
    const cacheKey = `tasks:list:${search}|${category}|${page}|${limit}|${shuffle}`;
    // Shuffled (default browse) results must not be cached — they should rotate
    // on every request/reload.
    if (!useShuffle) {
      const cached = cache.get(cacheKey);
      if (cached) return res.json(cached);
    }

    const filter = { status: { $in: ['open', 'in_progress'] } };

    if (search) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: rx }, { description: rx }];
    }
    // Accept any category value that exists in the data (no enum restriction).
    if (category) filter.category = category;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    let tasks, total;
    if (useShuffle) {
      total = await Task.countDocuments(filter);
      if (total === 0) {
        tasks = [];
      } else {
        const sampleSize = Math.min(total, skip + limitNum);
        const sampled = await Task.aggregate([
          { $match: filter },
          { $sample: { size: sampleSize } },
        ]);
        tasks = sampled.slice(skip, skip + limitNum);
      }
    } else {
      [tasks, total] = await Promise.all([
        Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Task.countDocuments(filter),
      ]);
    }

    const data = await attachClients(tasks);
    const withCounts = await withProposalCounts(data);
    const payload = {
      tasks: withCounts,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    };
    if (!useShuffle) cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('\n❌ [GET /tasks ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/mine — client's own tasks
router.get('/mine', auth, requireRole('client'), async (req, res) => {
  try {
    const tasks = await Task.find({ client_email: req.user.email }).sort({
      createdAt: -1,
    });
    const withCounts = await withProposalCounts(tasks);
    res.json({ tasks: withCounts });
  } catch (err) {
    console.error('\n❌ [GET /tasks/mine ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/:id — public task details (+ proposals if owner)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const data = (await attachClients([task]))[0];
    const isOwner = req.user && req.user.email === task.client_email;

    let proposals = [];
    if (isOwner) {
      proposals = await Proposal.find({ task_id: task._id }).sort({
        createdAt: -1,
      });
    }
    const count = await Proposal.countDocuments({
      $or: [{ task_id: task._id }, { task_id: task._id.toString() }],
    });
    const stored = task.proposals_count;
    const proposals_count = typeof stored === 'number' ? stored : count;
    res.json({
      task: { ...data, proposals_count },
      isOwner,
      proposals: isOwner ? proposals : [],
    });
  } catch (err) {
    console.error('\n❌ [GET /tasks/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks — create (client, or admin posting on behalf of a client)
router.post('/', auth, requireRole('client', 'admin'), async (req, res) => {
  try {
    const { title, category, description, budget, deadline } = req.body;
    if (!title || budget == null)
      return res.status(400).json({ message: 'Title and budget are required' });

    // A client posts under their own email; an admin may post on behalf of
    // any client by passing `client_email`.
    const client_email =
      req.user.role === 'admin' && req.body.client_email
        ? req.body.client_email
        : req.user.email;

    const task = await Task.create({
      title,
      category: CATEGORIES.includes(category) ? category : 'Other',
      description: description || '',
      budget,
      deadline: deadline ? String(deadline) : '',
      posted: new Date().toLocaleDateString('en-GB'),
      client_email,
    });
    res.status(201).json({ task });
  } catch (err) {
    console.error('\n❌ [POST /tasks ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id — update (owner only)
router.put('/:id', auth, requireRole('client'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.client_email !== req.user.email)
      return res.status(403).json({ message: 'You can only edit your own tasks' });

    const { title, category, description, budget, deadline, status } = req.body;
    if (title != null) task.title = title;
    if (category != null)
      task.category = CATEGORIES.includes(category) ? category : task.category;
    if (description != null) task.description = description;
    if (budget != null) task.budget = budget;
    if (deadline != null) task.deadline = deadline ? String(deadline) : '';
    if (status != null && ['open', 'in_progress', 'completed'].includes(status))
      task.status = status;

    await task.save();
    res.json({ task });
  } catch (err) {
    console.error('\n❌ [PUT /tasks/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id — delete (owner only)
router.delete('/:id', auth, requireRole('client'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.client_email !== req.user.email)
      return res.status(403).json({ message: 'You can only delete your own tasks' });

    await Task.deleteOne({ _id: task._id });
    await Proposal.deleteMany({ task_id: task._id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('\n❌ [DELETE /tasks/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks/:id/proposals — freelancer applies
router.post('/:id/proposals', auth, requireRole('freelancer'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'open')
      return res.status(400).json({ message: 'This task is no longer accepting proposals' });

    const { proposed_budget, estimated_days, cover_note } = req.body;
    if (proposed_budget == null || estimated_days == null)
      return res.status(400).json({ message: 'Proposed budget and estimated days are required' });

    const existing = await Proposal.findOne({
      task_id: task._id,
      freelancer_email: req.user.email,
      status: 'pending',
    });
    if (existing)
      return res.status(409).json({ message: 'You already have a pending proposal for this task' });

    const proposal = await Proposal.create({
      task_id: task._id,
      freelancer_email: req.user.email,
      proposed_budget,
      estimated_days,
      cover_note: cover_note || '',
    });
    res.status(201).json({ proposal });
  } catch (err) {
    console.error('\n❌ [POST /tasks/:id/proposals ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/:id/proposals — owner views proposals
router.get('/:id/proposals', auth, requireRole('client'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.client_email !== req.user.email)
      return res.status(403).json({ message: 'Only the task owner can view proposals' });

    const proposals = await Proposal.find({ task_id: task._id }).sort({
      createdAt: -1,
    });
    res.json({ proposals });
  } catch (err) {
    console.error('\n❌ [GET /tasks/:id/proposals ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
