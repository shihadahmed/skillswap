const router = require('express').Router();
const auth = require('../middleware/auth');
const { requireRole } = auth;
const Payment = require('../models/Payment');
const Task = require('../models/Task');
const Proposal = require('../models/Proposal');

// POST /api/payments/checkout — dummy one-click checkout for an accepted proposal
router.post('/checkout', auth, requireRole('client'), async (req, res) => {
  try {
    const { task_id } = req.body;
    const task = await Task.findById(task_id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.client_email !== req.user.email)
      return res.status(403).json({ message: 'Only the task owner can pay' });
    if (task.status !== 'in_progress')
      return res.status(400).json({ message: 'Task is not ready for payment' });

    const accepted = await Proposal.findOne({
      task_id: task._id,
      status: 'accepted',
    });
    if (!accepted)
      return res.status(400).json({ message: 'No accepted proposal for this task' });

    const payment = await Payment.create({
      client_email: req.user.email,
      freelancer_email: accepted.freelancer_email,
      task_id: task._id,
      amount: accepted.proposed_budget,
      payment_status: 'paid',
      paid_at: new Date(),
    });

    await Task.findByIdAndUpdate(task._id, { status: 'completed' });
    res.status(201).json(payment);
  } catch (err) {
    console.error('\n❌ [POST /payments/checkout ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
