const router = require('express').Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const authMiddleware = [auth];

// GET /api/notifications — get user's notifications (paginated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only = 'false' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = { user_email: req.user.email };
    if (unread_only === 'true') filter.is_read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user_email: req.user.email, is_read: false }),
    ]);

    res.json({
      notifications,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      unread_count: unreadCount,
    });
  } catch (err) {
    console.error('\n❌ [GET /notifications ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read — mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.user_email !== req.user.email)
      return res.status(403).json({ message: 'Not authorized' });

    notification.is_read = true;
    await notification.save();
    res.json({ notification });
  } catch (err) {
    console.error('\n❌ [PUT /notifications/:id/read ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all — mark all notifications as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user_email: req.user.email, is_read: false },
      { $set: { is_read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('\n❌ [PUT /notifications/read-all ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;