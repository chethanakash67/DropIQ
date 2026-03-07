require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const productsRouter = require('./routes/products');
const diqRouter = require('./routes/diq');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Passport / Google OAuth ──────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_NOT_SET',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_NOT_SET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
    scope: ['profile', 'email'],
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || '';
      const name = profile.displayName || '';
      const picture = profile.photos?.[0]?.value || '';
      done(null, { googleId: profile.id, email, name, picture });
    } catch (err) {
      done(err, null);
    }
  }
));

app.use(passport.initialize());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve Static Files ───────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/diq', diqRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DropIQ API running', timestamp: new Date().toISOString() });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  console.log(`
========================================
  DropIQ API  →  http://localhost:${PORT}
  Google OAuth: ${hasGoogle ? '✅ configured' : '⚠️  not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)'}
========================================
  `);
});

module.exports = app;
