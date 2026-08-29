const mongoose = require('mongoose');
const dns = require('dns');

// Local dev fallback: some routers' DNS can't resolve MongoDB Atlas SRV records.
// Use public resolvers only in dev so Vercel production DNS is unaffected.
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

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
