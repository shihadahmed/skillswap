const router = require('express').Router();
const auth = require('../middleware/auth');
const { requireRole } = auth;
const Review = require('../models/Review');
const Task = require('../models/Task');
const User = require('../models/User');

// POST /api/reviews — client leaves a review for a completed task's freelancer
router.post('/', auth, requireRole('client'), async (req, res) => {
  try {
    const { task_id, reviewee_email, rating, comment } = req.body;
    if (!task_id || !reviewee_email || rating == null)
      return res.status(400).json({
        message: 'task_id, reviewee_email and rating are required',
      });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const task = await Task.findById(task_id);
    if (!task || task.client_email !== req.user.email)
      return res.status(403).json({ message: 'Only the task owner can review' });
    if (task.status !== 'completed')
      return res.status(400).json({ message: 'Task must be completed first' });

    const existing = await Review.findOne({
      task_id,
      reviewer_email: req.user.email,
    });
    if (existing)
      return res.status(409).json({ message: 'You already reviewed this task' });

    const review = await Review.create({
      task_id,
      reviewer_email: req.user.email,
      reviewee_email,
      rating,
      comment: comment || '',
    });

    // recompute the freelancer's average rating on their User record
    const all = await Review.find({ reviewee_email });
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await User.findOneAndUpdate(
      { email: reviewee_email },
      { rating: avg, $inc: { jobsCompleted: 1 } }
    );

    res.status(201).json(review);
  } catch (err) {
    console.error('\n❌ [POST /reviews ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews?freelancer_email= — public list (best-effort by reviewee)
router.get('/', async (req, res) => {
  try {
    const { freelancer_email } = req.query;
    const filter = freelancer_email ? { reviewee_email: freelancer_email } : {};
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
