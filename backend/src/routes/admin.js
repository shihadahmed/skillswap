const router = require('express').Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { requireRole } = auth;
const User = require('../models/User');
const Task = require('../models/Task');
const Proposal = require('../models/Proposal');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

const admin = [auth, requireRole('admin')];

const passwordValid = (pw) => /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(pw);
const publicUser = (u) => ({
  id: u._id,
  _id: u._id,
  name: u.name,
  email: u.email,
  image: u.image,
  role: u.role,
  skills: u.skills,
  bio: u.bio,
  isBlocked: u.isBlocked,
  rating: u.rating,
  jobsCompleted: u.jobsCompleted,
  createdAt: u.createdAt,
});

// GET /api/admin/stats — aggregated counts for the admin overview
router.get('/stats', admin, async (req, res) => {
  try {
    const [users, tasks, payments] = await Promise.all([
      User.find().select('-password'),
      Task.find(),
      Payment.find(),
    ]);
    const byRole = (r) => users.filter((u) => u.role === r).length;
    res.json({
      users: users.length,
      clients: byRole('client'),
      freelancers: byRole('freelancer'),
      admins: byRole('admin'),
      tasks: tasks.length,
      activeTasks: tasks.filter((t) => t.status !== 'completed').length,
      openTasks: tasks.filter((t) => t.status === 'open').length,
      inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
      transactions: payments.length,
      revenue: payments.reduce((s, p) => s + (p.amount || 0), 0),
    });
  } catch (err) {
    console.error('\n❌ [GET /admin/stats ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users — list all users
router.get('/users', admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users: users.map(publicUser) });
  } catch (err) {
    console.error('\n❌ [GET /admin/users ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/users — create a user (admin). role may be admin/client/freelancer.
router.post('/users', admin, async (req, res) => {
  try {
    const { name, email, password, role, image, skills, bio } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (!passwordValid(password))
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 chars with one uppercase and one lowercase' });
    const safeRole = ['client', 'freelancer', 'admin'].includes(role) ? role : 'client';

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: safeRole,
      image: image || '',
      skills: Array.isArray(skills) ? skills : [],
      bio: bio || '',
    });
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    console.error('\n❌ [POST /admin/users ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id — update a user (name, email, role, image, bio, skills, isBlocked)
router.put('/users/:id', admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role, image, bio, skills, isBlocked } = req.body;
    if (name != null) user.name = name;
    if (email != null) user.email = email.toLowerCase();
    if (role != null && ['client', 'freelancer', 'admin'].includes(role)) user.role = role;
    if (image != null) user.image = image;
    if (bio != null) user.bio = bio;
    if (skills != null) user.skills = Array.isArray(skills) ? skills : [];
    if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;

    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'Email already in use' });
    console.error('\n❌ [PUT /admin/users/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/block — toggle block status
router.put('/users/:id/block', admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('\n❌ [PUT /admin/users/:id/block ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id — remove a user (and their tasks/proposals)
router.delete('/users/:id', admin, async (req, res) => {
  try {
    if (req.params.id === req.userId.toString())
      return res.status(400).json({ message: 'You cannot delete yourself' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin')
      return res.status(403).json({ message: 'Cannot delete another admin' });
    await User.deleteOne({ _id: user._id });
    await Task.deleteMany({ client_email: user.email });
    await Proposal.deleteMany({ freelancer_email: user.email });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('\n❌ [DELETE /admin/users/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/tasks — list every task (all statuses)
router.get('/tasks', admin, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    console.error('\n❌ [GET /admin/tasks ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/tasks/:id — admin edits any task
router.put('/tasks/:id', admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, category, description, budget, deadline, status } = req.body;
    const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];
    if (title != null) task.title = title;
    if (category != null) task.category = CATEGORIES.includes(category) ? category : task.category;
    if (description != null) task.description = description;
    if (budget != null) task.budget = budget;
    if (deadline != null) task.deadline = deadline ? String(deadline) : '';
    if (status != null && ['open', 'in_progress', 'completed'].includes(status))
      task.status = status;

    await task.save();
    res.json({ task });
  } catch (err) {
    console.error('\n❌ [PUT /admin/tasks/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/tasks/:id — remove a task (and its proposals)
router.delete('/tasks/:id', admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await Task.deleteOne({ _id: task._id });
    await Proposal.deleteMany({ task_id: task._id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('\n❌ [DELETE /admin/tasks/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/reviews — list all reviews (moderation)
router.get('/reviews', admin, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    console.error('\n❌ [GET /admin/reviews ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/reviews/:id — delete a review and recompute freelancer rating
router.delete('/reviews/:id', admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const email = review.reviewee_email;
    await Review.deleteOne({ _id: review._id });

    const remaining = await Review.find({ reviewee_email: email });
    const avg = remaining.length
      ? remaining.reduce((s, r) => s + r.rating, 0) / remaining.length
      : 0;
    await User.findOneAndUpdate(
      { email },
      { rating: avg, jobsCompleted: remaining.length }
    );
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('\n❌ [DELETE /admin/reviews/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/transactions — list all payments
router.get('/transactions', admin, async (req, res) => {
  try {
    const transactions = await Payment.find().sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (err) {
    console.error('\n❌ [GET /admin/transactions ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
