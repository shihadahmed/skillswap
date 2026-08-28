require('dotenv').config();
const express = require('express');

process.on('unhandledRejection', (reason) =>
  console.error('\n❌ [UNHANDLED PROMISE REJECTION]', reason)
);
process.on('uncaughtException', (err) =>
  console.error('\n❌ [UNCAUGHT EXCEPTION]', err)
);
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const swapRoutes = require('./routes/swaps');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const { exec } = require('child_process');

const findPidOnPort = (port) =>
  new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
      if (err || !stdout) return resolve(null);
      const match = stdout
        .split('\n')
        .find((line) => line.includes('LISTENING'));
      if (!match) return resolve(null);
      const pid = match.trim().split(/\s+/).pop();
      resolve(pid && /^\d+$/.test(pid) ? pid : null);
    });
  });

const killProcess = (pid) =>
  new Promise((resolve) => {
    exec(`taskkill /PID ${pid} /F`, (err) => resolve(!err));
  });

const startServer = async (port, attempt = 0) => {
  const server = app.listen(port);

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE' && attempt === 0) {
      console.warn(`⚠️  Port ${port} busy — looking for the process holding it...`);
      const pid = await findPidOnPort(port);
      if (pid) {
        console.warn(`   Killing stale process PID ${pid} on port ${port}...`);
        await killProcess(pid);
        await new Promise((r) => setTimeout(r, 800));
        server.close();
        return startServer(port, 1);
      }
      console.error(`\n❌ Port ${port} is already in use and no owner found.`);
      console.error('   Set a different PORT in backend/.env');
      process.exit(1);
    }
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${port} is already in use.`);
      console.error('   Set a different PORT in backend/.env');
      process.exit(1);
    }
    console.error('\n❌ Server error:', err);
    process.exit(1);
  });

  server.on('listening', () =>
    console.log(`SkillSwap API listening on http://localhost:${port}`)
  );
};

connectDB().then(() => startServer(PORT));
