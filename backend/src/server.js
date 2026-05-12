require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const productsRouter = require('./routes/products');
const diqRouter = require('./routes/diq');
const authRouter = require('./routes/auth');
const webhooksRouter = require('./routes/webhooks');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'https://dropiq-t62y.onrender.com/api/auth/google/callback';
const SERVICE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

function startSchedulers() {
  if (process.env.DISABLE_SCHEDULERS === 'true') {
    console.log('Background schedulers disabled by DISABLE_SCHEDULERS=true');
    return;
  }

  // ── Background Schedulers ──────────────────────────────────────────────────
  require('./scheduler/monthly-ingestion');
  require('./scheduler/samsung-ingestion');
  require('./scheduler/offline-store-sync');
}

// ── Simple Logger ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Passport / Google OAuth ──────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_NOT_SET',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_NOT_SET',
    callbackURL: GOOGLE_CALLBACK_URL,
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
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:3004',
    'https://dropiq-nine.vercel.app',
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_DASHBOARD_URL,
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
app.use('/api/webhooks', webhooksRouter);
app.use('/api/contact', contactRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DropIQ API running', timestamp: new Date().toISOString() });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});

const server = app.listen(PORT, () => {
  startSchedulers();

  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  console.log(`
========================================
  DropIQ API  →  ${SERVICE_URL}
  Google OAuth: ${hasGoogle ? '✅ configured' : '⚠️  not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)'}
  Google Callback URL: ${GOOGLE_CALLBACK_URL}
========================================
  `);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`
========================================
  Port ${PORT} is already in use.
========================================
Another backend process is already running on http://localhost:${PORT}.

To find it:
  lsof -nP -iTCP:${PORT} -sTCP:LISTEN

To stop it:
  kill <PID>
========================================
`);
    process.exit(1);
  }

  throw error;
});

module.exports = app;
