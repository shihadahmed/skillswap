const router = require('express').Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { requireRole } = auth;
const User = require('../models/User');
const Task = require('../models/Task');
const Proposal = require('../models/Proposal');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

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
    
    // Calculate platform net profit from stored fee breakdown
    const platformNetProfit = payments.reduce((s, p) => s + (p.platform_net_profit || 0), 0);
    const totalClientVolume = payments.reduce((s, p) => s + (p.total_paid_by_client || p.amount || 0), 0);
    const freelancerPayouts = payments.reduce((s, p) => s + (p.freelancer_net_payout || 0), 0);
    const gatewayFeesCollected = payments.reduce((s, p) => s + (p.gateway_fee || 0), 0);
    const vatCollected = payments.reduce((s, p) => s + (p.vat_amount || 0), 0);

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
      transactions: payments.slice(0, 5).map((p) => ({
        _id: p._id,
        client_email: p.client_email,
        freelancer_email: p.freelancer_email,
        task_id: p.task_id,
        total_paid_by_client: p.total_paid_by_client || p.amount || 0,
        createdAt: p.createdAt,
      })),
      revenue: totalClientVolume,
      platformNetProfit,
      freelancerPayouts,
      gatewayFeesCollected,
      vatCollected,
    });
  } catch (err) {
    console.error('\n❌ [GET /admin/stats ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users — list all users (paginated)
router.get('/users', admin, async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;
    const [users, total] = await Promise.all([
      User.find()
        .select('name email image role skills bio isBlocked rating jobsCompleted createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(),
    ]);
    res.json({
      users: users.map(publicUser),
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
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

// GET /api/admin/tasks — list every task (all statuses, paginated)
router.get('/tasks', admin, async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;
    const [tasks, total] = await Promise.all([
      Task.find().select('title category description budget priority urgency experience_level project_type estimated_duration skills status client_email posted proposals_count deadline rejection_reason createdAt').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Task.countDocuments(),
    ]);
    res.json({
      tasks,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
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

    const {
      title,
      category,
      description,
      budget,
      priority,
      urgency,
      experience_level,
      project_type,
      estimated_duration,
      skills,
      deadline,
      status,
    } = req.body;
    const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];
    if (title != null) task.title = title;
    if (category != null) task.category = CATEGORIES.includes(category) ? category : task.category;
    if (description != null) task.description = description;
    if (budget != null) task.budget = budget;
    if (priority != null) task.priority = priority;
    if (urgency != null) task.urgency = urgency;
    if (experience_level != null) task.experience_level = experience_level;
    if (project_type != null) task.project_type = project_type;
    if (estimated_duration != null) task.estimated_duration = estimated_duration;
    if (skills != null) task.skills = Array.isArray(skills) ? skills : [];
    if (deadline != null) task.deadline = deadline ? String(deadline) : '';
    if (status != null && ['open', 'in_progress', 'completed', 'pending', 'rejected', 'cancelled'].includes(status))
      task.status = status;

    await task.save();
    res.json({ task });
  } catch (err) {
    console.error('\n❌ [PUT /admin/tasks/:id ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/tasks/:id/approve — approve a pending task
router.put('/tasks/:id/approve', admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending tasks can be approved' });
    }

    const { rejection_reason } = req.body;
    const approved = !rejection_reason;

    if (approved) {
      task.status = 'open';
      task.rejection_reason = '';
    } else {
      task.status = 'rejected';
      task.rejection_reason = rejection_reason || 'No reason provided';
    }

    await task.save();

    // Create notification for the client
    const notificationType = approved ? 'task_approved' : 'task_rejected';
    const title = approved ? 'Task Approved' : 'Task Rejected';
    const message = approved
      ? `Your task "${task.title}" has been approved and is now live on the marketplace.`
      : `Your task "${task.title}" was rejected. Reason: ${task.rejection_reason}`;

    await Notification.create({
      user_email: task.client_email,
      type: notificationType,
      title,
      message,
      related_task_id: task._id,
    });

    res.json({ task, notification: { type: notificationType, title, message } });
  } catch (err) {
    console.error('\n❌ [PUT /admin/tasks/:id/approve ERROR]', err);
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

// GET /api/admin/reviews — list all reviews (moderation, paginated)
router.get('/reviews', admin, async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;
    const [reviews, total] = await Promise.all([
      Review.find().select('reviewer_email reviewee_email rating comment task_id createdAt').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Review.countDocuments(),
    ]);
    res.json({
      reviews,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
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

// GET /api/admin/transactions — list all payments (paginated)
router.get('/transactions', admin, async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;
    const [transactions, total] = await Promise.all([
      Payment.find().select('client_email freelancer_email task_id amount payment_status paid_at createdAt').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Payment.countDocuments(),
    ]);
    res.json({
      transactions,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('\n❌ [GET /admin/transactions ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
