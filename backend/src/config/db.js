const mongoose = require('mongoose');

// Reuse a single connection across Vercel serverless invocations.
const cached = global._mongooseCache || (global._mongooseCache = {});

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        console.log('MongoDB connected:', m.connection.name);
        return m;
      })
      .catch((err) => {
        console.error('MongoDB connection failed:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
