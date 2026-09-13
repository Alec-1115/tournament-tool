const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const cors = require('cors');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Required environment variables
const requiredEnv = [
  'MONGO_URI',
  'SESSION_SECRET',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'DISCORD_REDIRECT_URI',
  'FRONTEND_URL'
];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    console.error(
      `❌ ${name} is not set. Add it to the Render environment variables.`
    );

    process.exit(1);
  }
}

// Allow the Vercel frontend to communicate with the backend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Parse JSON requests
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,

  resave: false,

  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60
  }),

  cookie: {
    httpOnly: true,

    secure: process.env.NODE_ENV === 'production',

    sameSite: process.env.NODE_ENV === 'production'
      ? 'none'
      : 'lax',

    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

// Authentication routes
app.use('/auth', authRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(
      '❌ MongoDB connection error:',
      err.message
    );

    process.exit(1);
  });