const router = require('express').Router();
const auth = require('../middleware/auth');
const { requireRole } = auth;
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const notifyAdminsOfPendingProfile = async (role, user) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('email');
    if (!admins.length) return;
    const title = `New ${role} profile submitted`;
    const message = `${user.name} (${user.email}) is awaiting approval.`;
    await Notification.insertMany(
      admins.map((a) => ({
        user_email: a.email,
        type: 'account_approval',
        title,
        message,
      }))
    );
  } catch (e) {
    console.error('\n❌ [notifyAdminsOfPendingProfile ERROR]', e.message || e);
  }
};

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  image: u.image,
  role: u.role,
});

router.get('/metadata', async (req, res) => {
  try {
    const [taskCategories, freelancerCategories, taskSkills, freelancerSkills] =
      await Promise.all([
        Task.distinct('category'),
        Freelancer.distinct('categories'),
        Task.distinct('skills'),
        Freelancer.distinct('skills'),
      ]);

    const uniqueCategories = Array.from(
      new Set(
        [...taskCategories, ...freelancerCategories]
          .map((s) => (s || '').trim())
          .filter(Boolean)
      )
    ).sort();

    const uniqueSkills = Array.from(
      new Set(
        [...taskSkills, ...freelancerSkills]
          .map((s) => (s || '').trim())
          .filter(Boolean)
      )
    ).sort();

    res.json({ categories: uniqueCategories, skills: uniqueSkills });
  } catch (err) {
    console.error('\n❌ [GET /onboarding/metadata ERROR]', err);
    res.status(500).json({ message: 'Failed to load metadata' });
  }
});

router.get('/client', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'client') return res.status(403).json({ message: 'Access denied: client role required' });
    if (user.isProfileComplete && user.isApproved) return res.redirect('/dashboard/client');
    res.json({ user, needsOnboarding: !user.isProfileComplete || !user.isApproved });
  } catch (err) {
    console.error('\n❌ [GET /onboarding/client ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/freelancer', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'freelancer') return res.status(403).json({ message: 'Access denied: freelancer role required' });
    if (user.isProfileComplete && user.isApproved) return res.redirect('/dashboard/freelancer');
    res.json({ user, needsOnboarding: !user.isProfileComplete || !user.isApproved });
  } catch (err) {
    console.error('\n❌ [GET /onboarding/freelancer ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/client', auth, async (req, res) => {
  try {
    const { full_name, company_name, headline, location, phone, about, industry, company_size, avatar } = req.body;
    const user = req.user;

    if (!full_name || !location || !phone) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    user.isProfileComplete = true;
    user.approvalStatus = 'pending';
    user.name = full_name;
    if (company_name) user.company_name = company_name;
    if (headline) user.headline = headline;
    if (location) {
      user.location = { city: location.city, country: location.country };
    }
    if (phone) user.phone_number = phone;
    if (about) user.about = about;
    if (industry) user.industry = industry;
    if (company_size) user.company_size = company_size;
    if (avatar) user.image = avatar;
    await user.save();

    await notifyAdminsOfPendingProfile('client', user);

    res.json({ user: publicUser(user), needsApproval: true });
  } catch (err) {
    console.error('\n❌ [POST /onboarding/client ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/freelancer', auth, freelancerOnboardingHandler);
router.put('/freelancer', auth, freelancerOnboardingHandler);

async function freelancerOnboardingHandler(req, res) {
  try {
    // TODO: remove after onboarding is stable
    console.log('\n🟢 [Onboarding Payload]', JSON.stringify(req.body, null, 2));

    const { full_name, headline, hourly_rate, location, phone, experience_level, bio, skills, categories, avatar, availability_status, availability_hours } = req.body;
    const user = req.user;

    if (!full_name || !hourly_rate || !location || !experience_level) {
      return res.status(400).json({ message: 'Required fields are missing: full_name, hourly_rate, location, experience_level' });
    }

    user.isProfileComplete = true;
    user.approvalStatus = 'pending';
    user.name = full_name;
    if (headline) user.headline = headline;
    user.hourlyRate = Number(hourly_rate);
    if (location) {
      user.location = { city: location.city, country: location.country };
    }
    if (phone) user.phone_number = phone;
    if (experience_level) user.experience_level = experience_level;
    if (bio) user.bio = bio;
    if (skills) user.skills = Array.isArray(skills) ? skills : [];
    if (categories) user.categories = Array.isArray(categories) ? categories : [];
    if (avatar) user.image = avatar;
    if (availability_status) {
      // Store availability info
    }
    await user.save();

    await notifyAdminsOfPendingProfile('freelancer', user);

    res.json({ user: publicUser(user), needsApproval: true });
  } catch (err) {
    console.error('\n❌ [POST /onboarding/freelancer ERROR]', err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = router;