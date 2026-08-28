require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin1@taskhive.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1@taskhive.com';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: hash,
        role: 'admin',
        isBlocked: false,
      },
    },
    { upsert: true }
  );
  console.log(`Admin ensured: ${ADMIN_EMAIL}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
