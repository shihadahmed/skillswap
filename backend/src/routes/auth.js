const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const passwordValid = (pw) => /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(pw);

const setAuthCookie = (res, userId) => {
  const token = signToken(userId);
  res.cookie('ss_token', token, cookieOptions);
  return token;
};

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  image: u.image,
  role: u.role,
  skills: u.skills,
  bio: u.bio,
  rating: u.rating,
  jobsCompleted: u.jobsCompleted,
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, image, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (!passwordValid(password))
      return res.status(400).json({
        message:
          'Password must be at least 6 characters and include one uppercase and one lowercase letter',
      });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    // Form registration: only "client" or "freelancer" allowed; admin is seeded.
    const safeRole = role === 'freelancer' ? 'freelancer' : 'client';

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      image: image || '',
      role: safeRole,
    });

    const token = setAuthCookie(res, user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('\n❌ [REGISTER ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isBlocked)
      return res.status(403).json({ message: 'This account has been blocked' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = setAuthCookie(res, user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('\n❌ [LOGIN ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('ss_token', { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd });
  res.json({ message: 'Logged out' });
});

router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(publicUser(user));
  } catch (err) {
    console.error('\n❌ [GET /me ERROR]', err);
    res.status(500).json({ message: err.message });
  }
});

// ---------------- Google OAuth (manual flow, keys from env) ----------------

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri)
    return res.status(400).json({ message: 'Google OAuth is not configured' });

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&prompt=select_account`;
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!code || !clientId || !clientSecret || !redirectUri)
      return res.status(400).send('Google OAuth is not configured');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token)
      return res.status(400).send('Google authentication failed');

    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const profile = await profileRes.json();

    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        image: profile.picture || '',
        role: 'client', // Google sign-in is always a client
      });
    }

    // Google users are always clients; do not downgrade/upgrade existing roles.
    const token = setAuthCookie(res, user._id);
    const frontend = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
    return res.redirect(`${frontend}/dashboard/client`);
  } catch (err) {
    console.error('\n❌ [GOOGLE CALLBACK ERROR]', err);
    return res.status(500).send('Google authentication error');
  }
});

module.exports = router;
