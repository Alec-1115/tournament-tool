const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const cors = require('cors');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

app.use(session({
  name: 'tournament.sid',

  secret: process.env.SESSION_SECRET,

  resave: false,

  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 30 * 24 * 60 * 60
  }),

  cookie: {
    httpOnly: true,

    secure: true,

    sameSite: 'none',

    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

app.use('/auth', authRoutes);

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