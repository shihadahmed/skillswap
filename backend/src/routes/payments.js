const router = require('express').Router();
const auth = require('../middleware/auth');
const { requireRole } = auth;
const Payment = require('../models/Payment');
const Task = require('../models/Task');
const Proposal = require('../models/Proposal');
const { calculateMarketplaceFees } = require('../lib/fees');

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

    // Calculate full marketplace fee breakdown
    const fees = calculateMarketplaceFees(accepted.proposed_budget);

    const payment = await Payment.create({
      client_email: req.user.email,
      freelancer_email: accepted.freelancer_email,
      task_id: task._id,

      // Store complete fee breakdown
      base_bid_amount: fees.baseAmount,
      freelancer_fee_deducted: fees.freelancerFeeDeducted,
      freelancer_net_payout: fees.freelancerNetPayout,
      client_service_fee: fees.clientServiceFee,
      vat_amount: fees.vatAmount,
      gateway_fee: fees.gatewayFee,
      total_paid_by_client: fees.totalPaidByClient,
      platform_net_profit: fees.platformNetProfit,

      // Legacy field for backward compatibility
      amount: fees.totalPaidByClient,

      payment_status: 'paid',
      paid_at: new Date(),
    });

    // Dynamic System Synchronization
    // 1. Update task status to completed
    await Task.findByIdAndUpdate(task._id, { status: 'completed' });

    // 2. Update client stats: add to total_spent, decrement active_jobs
    await Client.findOneAndUpdate(
      { user_email: req.user.email },
      {
        $inc: { total_spent: fees.totalPaidByClient, $dec: { active_jobs: 1 } },
      }
    );

    // 3. Update freelancer stats: add to total_earned, increment completed jobs
    await Freelancer.findOneAndUpdate(
      { user_email: accepted.freelancer_email },
      {
        $inc: { total_earned: fees.freelancerNetPayout, $inc: { total_completed_jobs: 1 } },
      }
    );

    // 4. Recalculate client rating if there are reviews
    // (Rating recalculation happens on review submission)

    res.status(201).json(payment);
  } catch (err) {
    console.error('\n❌ [POST /payments/checkout ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
