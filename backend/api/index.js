require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

console.log('[vercel] MONGODB_URI configured:', Boolean(process.env.MONGODB_URI));

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[vercel] DB connect error:', err.message);
    return res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
  return app(req, res);
};
