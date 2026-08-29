const router = require('express').Router();
const Task = require('../models/Task');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireRole } = auth;

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];

const clientView = (u) =>
  u ? { name: u.name, image: u.image, email: u.email } : null;

// Attach a client object to each task. The seeded/real data already embeds a
// rich `client`, so we preserve it; otherwise we leave the document as-is.
async function attachClients(tasks) {
  return tasks.map((t) => (t.toObject ? t.toObject() : t));
}

// GET /api/tasks — public browse with search, category filter, pagination
// query: search, category, page (default 1), limit (default 9)
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', page = 1, limit = 9 } = req.query;
    const filter = { status: { $in: ['open', 'in_progress'] } };

    if (search) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: rx }, { description: rx }];
    }
    if (category && CATEGORIES.includes(category)) filter.category = category;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Task.countDocuments(filter),
    ]);

    const data = await attachClients(tasks);
    res.json({
      tasks: data,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('\n❌ [GET /tasks ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/mine — client's own tasks
router.get('/mine', auth, requireRole('client'), async (req, res) => {
  try {
    const tasks = await Task.find({ client_email: req.user.email }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    console.error('\n❌ [GET /tasks/mine ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/:id — public task details (+ proposals if owner)
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const data = (await attachClients([task]))[0];
    const isOwner = req.user && req.user.email === task.client_email;

    let proposals = [];
    if (isOwner) {
      proposals = await Proposal.find({ task_id: task._id }).sort({ createdAt: -1 });
    }
    res.json({ task: data, isOwner, proposals: isOwner ? proposals : [] });
  } catch (err) {
    console.error('\n❌ [GET /tasks/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks — create (client only)
router.post('/', auth, requireRole('client'), async (req, res) => {
  try {
    const { title, category, description, budget, deadline } = req.body;
    if (!title || budget == null)
      return res.status(400).json({ message: 'Title and budget are required' });

    const task = await Task.create({
      title,
      category: CATEGORIES.includes(category) ? category : 'Other',
      description: description || '',
      budget,
      deadline: deadline ? String(deadline) : '',
      posted: new Date().toLocaleDateString('en-GB'),
      client_email: req.user.email,
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
    if (category != null) task.category = CATEGORIES.includes(category) ? category : task.category;
    if (description != null) task.description = description;
    if (budget != null) task.budget = budget;
    if (deadline != null) task.deadline = deadline ? new Date(deadline) : undefined;
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

    const proposals = await Proposal.find({ task_id: task._id }).sort({ createdAt: -1 });
    res.json({ proposals });
  } catch (err) {
    console.error('\n❌ [GET /tasks/:id/proposals ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
