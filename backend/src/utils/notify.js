const Notification = require('../models/Notification');
const User = require('../models/User');

async function createNotification({ userEmail, title, message, type, link = null }) {
  try {
    await Notification.create({
      user_email: userEmail,
      title,
      message,
      type,
      is_read: false,
    });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
}

async function notifyAdmin({ title, message, type = 'admin_alert' }) {
  try {
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        userEmail: admin.email,
        title: `[Admin] ${title}`,
        message,
        type,
      });
    }
  } catch (err) {
    console.error('Admin notification failed:', err.message);
  }
}

module.exports = { createNotification, notifyAdmin };
