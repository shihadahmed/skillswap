const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const swapRoutes = require('./routes/swaps');
const taskRoutes = require('./routes/tasks');
const proposalRoutes = require('./routes/proposals');
const freelancerRoutes = require('./routes/freelancers');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const connectDB = require('./config/db');
// Future phases will mount: payments, reviews

const app = express();

app.use(helmet());
app.use(
  cors({
    // Reflect the requesting origin so cookie-based auth works for localhost,
    // 127.0.0.1, and the Vercel frontend alike. (ACAC is still true below.)
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Request logger — shows every call in the terminal / Vercel logs
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `[REQ] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
});

// Root route — clean status page instead of raw JSON / "Cannot GET /"
app.get('/', async (req, res) => {
  let dbOk = false;
  try {
    await connectDB();
    dbOk = mongoose.connection.readyState === 1;
  } catch (e) {
    dbOk = false;
  }
  const color = dbOk ? '#16a34a' : '#dc2626';
  const label = dbOk ? 'connected' : 'disconnected';
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SkillSwap API</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,sans-serif;background:#fafafb;color:#0f172a;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
    .card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:36px 44px;box-shadow:0 10px 30px rgba(15,23,42,.06);text-align:center;max-width:420px}
    .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:middle}
    h1{font-size:22px;margin:0 0 6px}
    p{color:#64748b;margin:6px 0}
    code{background:#f1f5f9;padding:2px 8px;border-radius:6px;font-size:13px}
  </style>
</head>
<body>
  <div class="card">
    <h1><span class="dot" style="background:#4f46e5"></span>SkillSwap API</h1>
    <p>Server is running.</p>
    <p>Database: <span class="dot" style="background:${color}"></span><strong style="color:${color}">${label}</strong></p>
    <p>Health check: <code>GET /api/health</code></p>
  </div>
</body>
</html>`);
});

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
