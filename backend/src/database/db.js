require('dotenv').config();
const dns = require('dns');
const { Pool } = require('pg');

// Force IPv4 DNS resolution — Render cannot reach Supabase via IPv6.
dns.setDefaultResultOrder('ipv4first');

const isProduction = process.env.NODE_ENV === 'production';

// Render sets RENDER=true and RENDER_EXTERNAL_URL automatically on all services.
// Detect hosted environment even if NODE_ENV isn't explicitly set.
const isRender = !!(process.env.RENDER || process.env.RENDER_EXTERNAL_URL);
const isHosted = isProduction || isRender;

// ── Supabase IPv6→IPv4 Pooler Auto-Fix ──────────────────────────────────────
// Supabase direct DB hosts (db.REF.supabase.co) are IPv6-ONLY.
// Render's free tier cannot make IPv6 outbound connections.
// This function rewrites the URL to use the Supabase Connection Pooler,
// which runs on *.pooler.supabase.com and supports IPv4.
function fixSupabaseDirectUrl(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    // Match db.<ref>.supabase.co (direct connection — IPv6 only)
    const directMatch = parsed.hostname.match(/^db\.([a-z]+)\.supabase\.co$/);
    if (directMatch && isHosted) {
      const ref = directMatch[1];
      // Rewrite to pooler: username becomes postgres.REF, host becomes pooler, port 6543
      const originalUser = parsed.username; // usually "postgres"
      parsed.username = `${originalUser}.${ref}`;
      parsed.hostname = `aws-0-ap-south-1.pooler.supabase.com`;
      parsed.port = '6543';
      const newUrl = parsed.toString();
      console.log(`[DB] Auto-converted Supabase direct URL (IPv6-only) → pooler URL (IPv4)`);
      console.log(`[DB]   From: db.${ref}.supabase.co:5432`);
      console.log(`[DB]   To:   aws-0-ap-south-1.pooler.supabase.com:6543`);
      return newUrl;
    }
  } catch (_) { /* not a valid URL, skip */ }
  return url;
}

const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env.RENDER_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  '';

const connectionString = fixSupabaseDirectUrl(rawConnectionString);

// ── Hosted environment guards ───────────────────────────────────────────────
const host = process.env.DB_HOST || process.env.PGHOST;
const port = process.env.DB_PORT || process.env.PGPORT;
const database = process.env.DB_NAME || process.env.PGDATABASE;
const user = process.env.DB_USER || process.env.PGUSER;
const password = process.env.DB_PASSWORD || process.env.PGPASSWORD;

const hasDiscreteConfig = !!(host && port && database && user && password);

if (isHosted && !connectionString && !hasDiscreteConfig) {
  console.error(
    '\n==========================================================\n' +
    '  FATAL: DATABASE_URL is NOT configured!\n' +
    '  The backend cannot connect to PostgreSQL.\n\n' +
    '  Go to Render Dashboard → Environment → Add:\n' +
    '    DATABASE_URL = postgresql://postgres.XXX:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres\n\n' +
    '  Or set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD\n' +
    '==========================================================\n'
  );
  throw new Error(
    'Database is not configured for hosted environment. Set DATABASE_URL (recommended) or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD in Render Environment Variables.'
  );
}

if (isHosted && !connectionString && (host === 'localhost' || host === '127.0.0.1' || host === '::1')) {
  throw new Error(
    `Invalid hosted database host: DB_HOST=${host}. Use a managed Postgres host or DATABASE_URL.`
  );
}

// ── SSL ─────────────────────────────────────────────────────────────────────
const shouldUseSsl =
  isHosted ||
  process.env.DB_SSL === 'true' ||
  process.env.PGSSLMODE === 'require' ||
  /sslmode=require/i.test(connectionString);

// ── Pool Configuration ──────────────────────────────────────────────────────
const poolConfig = connectionString
  ? {
    connectionString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: isHosted ? 10000 : 5000,
    idleTimeoutMillis: isHosted ? 30000 : 10000,
    max: isHosted ? 20 : 10,
  }
  : {
    host,
    port,
    database,
    user,
    password,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
  };

// Log what we're connecting to (without secrets)
const target = connectionString
  ? `DATABASE_URL (${connectionString.replace(/\/\/[^@]+@/, '//***@').substring(0, 80)}...)`
  : `${host}:${port}/${database}`;
console.log(`[DB] Environment: ${isHosted ? 'HOSTED' : 'LOCAL'} | Target: ${target}`);

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log(`[DB] Connection established (${connectionString ? 'DATABASE_URL' : `${host}:${port}/${database}`})`);
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected database error:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
