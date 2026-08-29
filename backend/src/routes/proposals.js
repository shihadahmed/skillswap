const router = require('express').Router();
const Proposal = require('../models/Proposal');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { requireRole } = auth;

// GET /api/proposals/mine — freelancer's own proposals (with task info)
router.get('/mine', auth, requireRole('freelancer'), async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer_email: req.user.email }).sort({
      createdAt: -1,
    });
    const taskIds = proposals.map((p) => p.task_id);
    const tasks = await Task.find({ _id: { $in: taskIds } });
    const map = new Map(tasks.map((t) => [t._id.toString(), t]));
    const data = proposals.map((p) => ({
      ...p.toObject(),
      task: map.get(p.task_id.toString()) || null,
    }));
    res.json({ proposals: data });
  } catch (err) {
    console.error('\n❌ [GET /proposals/mine ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/proposals/:id — accept or reject (task owner only)
router.put('/:id', auth, requireRole('client'), async (req, res) => {
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
router.post('/:id/deliver', auth, requireRole('freelancer'), async (req, res) => {
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

module.exports = router;
