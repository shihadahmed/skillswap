const router = require('express').Router();
const Proposal = require('../models/Proposal');
const Task = require('../models/Task');
const Freelancer = require('../models/Freelancer');
const auth = require('../middleware/auth');
const { requireRole, requireApproved } = auth;
const { createNotification, notifyAdmin } = require('../utils/notify');

// GET /api/proposals/mine — freelancer's own proposals (paginated + summary)
router.get('/mine', auth, requireRole('freelancer'), async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;
    const filter = { freelancer_email: req.user.email };

    const [all, proposals, total] = await Promise.all([
      Proposal.find(filter),
      Proposal.find(filter)
        .select('task_id freelancer_email proposed_budget estimated_days cover_note deliverable_url status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Proposal.countDocuments(filter),
    ]);

    const taskIds = proposals.map((p) => p.task_id);
    const tasks = await Task.find({ _id: { $in: taskIds } }).select(
      'title client_email status description deadline'
    );
    const map = new Map(tasks.map((t) => [t._id.toString(), t]));
    const data = proposals.map((p) => ({
      ...p.toObject(),
      task: map.get(p.task_id.toString()) || null,
    }));

    const summary = {
      sent: all.length,
      pending: all.filter((p) => p.status === 'pending').length,
      accepted: all.filter((p) => p.status === 'accepted').length,
      earnings: all
        .filter((p) => p.status === 'accepted')
        .reduce((s, p) => s + (Number(p.proposed_budget) || 0), 0),
    };

    res.json({
      proposals: data,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      summary,
    });
  } catch (err) {
    console.error('\n❌ [GET /proposals/mine ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/proposals/:id — accept or reject (task owner only)
router.put('/:id', auth, requireRole('client'), requireApproved, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Status must be accepted or rejected' });

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    const task = await Task.findById(proposal.task_id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.client_email !== req.user.email)
      return res.status(403).json({ message: 'Only the task owner can manage proposals' });

    if (status === 'accepted') {
      // one accepted per task: accept this, reject all other pending ones
      proposal.status = 'accepted';
      await proposal.save();
      await Proposal.updateMany(
        { task_id: task._id, _id: { $ne: proposal._id }, status: 'pending' },
        { $set: { status: 'rejected' } }
      );
      task.status = 'in_progress';
      await task.save();

      // Notify the freelancer (hired) and admins (contract started).
      await Promise.all([
        createNotification({
          userEmail: proposal.freelancer_email,
          title: 'Proposal Accepted',
          message: `You have been hired for "${task.title}".`,
          type: 'account_approved',
        }),
        notifyAdmin({
          title: 'Contract Started',
          message: `Client ${task.client_email} hired ${proposal.freelancer_email} for "${task.title}".`,
          type: 'admin_alert',
        }),
      ]);
    } else {
      proposal.status = 'rejected';
      await proposal.save();
    }

    res.json({ proposal, task });
  } catch (err) {
    console.error('\n❌ [PUT /proposals/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/proposals/:id/deliver — freelancer submits the deliverable URL
// and marks the accepted task as completed.
router.post('/:id/deliver', auth, requireRole('freelancer'), requireApproved, async (req, res) => {
  try {
    const { deliverable_url } = req.body;
    if (!deliverable_url || !/^https?:\/\/.+/.test(deliverable_url)) {
      return res.status(400).json({ message: 'A valid deliverable URL is required' });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.freelancer_email !== req.user.email)
      return res.status(403).json({ message: 'Only the freelancer can submit this deliverable' });
    if (proposal.status !== 'accepted')
      return res.status(400).json({ message: 'This proposal is not accepted' });

    proposal.deliverable_url = deliverable_url;
    await proposal.save();

    const task = await Task.findById(proposal.task_id);
    if (task) {
      task.status = 'completed';
      await task.save();
    }

    res.json({ proposal, task });
  } catch (err) {
    console.error('\n❌ [POST /proposals/:id/deliver ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/proposals -> create proposal (client posts on behalf of themselves)
// This is used when a client wants to hire a freelancer without a task
router.post('/', auth, requireRole('client'), requireApproved, async (req, res) => {
  try {
    const { freelancer_email, proposed_budget, estimated_days, cover_note } = req.body;
    if (!freelancer_email || !proposed_budget || !estimated_days)
      return res.status(400).json({ message: 'freelancer_email, proposed_budget and estimated_days are required' });

    // Check if freelancer exists
    const freelancer = await Freelancer.findOne({ email: freelancer_email });
    if (!freelancer) return res.status(404).json({ message: 'Freelancer not found' });

    // Check if there's already a pending proposal for this freelancer
    const existing = await Proposal.findOne({
      freelancer_email,
      status: 'pending',
    });
    if (existing)
      return res.status(409).json({ message: 'You already have a pending proposal for this freelancer' });

    const proposal = await Proposal.create({
      task_id: '', // No specific task, general hire
      freelancer_email,
      proposed_budget,
      estimated_days,
      cover_note: cover_note || '',
      status: 'pending',
    });
    res.status(201).json({ proposal });
  } catch (err) {
    console.error('\n❌ [POST /proposals ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
