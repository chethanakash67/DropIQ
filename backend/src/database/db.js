require('dotenv').config();
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const connectionString =
  process.env.DATABASE_URL ||
  process.env.RENDER_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  '';

const shouldUseSsl =
  process.env.DB_SSL === 'true' ||
  process.env.PGSSLMODE === 'require' ||
  /sslmode=require/i.test(connectionString);

const host = process.env.DB_HOST || process.env.PGHOST;
const port = process.env.DB_PORT || process.env.PGPORT;
const database = process.env.DB_NAME || process.env.PGDATABASE;
const user = process.env.DB_USER || process.env.PGUSER;
const password = process.env.DB_PASSWORD || process.env.PGPASSWORD;

const hasDiscreteConfig = !!(host && port && database && user && password);

if (isProduction && !connectionString && !hasDiscreteConfig) {
  throw new Error(
    'Database is not configured for production. Set DATABASE_URL (recommended) or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD.'
  );
}

if (isProduction && !connectionString && host === 'localhost') {
  throw new Error(
    'Invalid production database host: DB_HOST=localhost. Use a managed Postgres host or DATABASE_URL.'
  );
}

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host,
      port,
      database,
      user,
      password,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
    };

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  const target = connectionString ? 'DATABASE_URL/connection string' : `${host}:${port}/${database}`;
  console.log(`Database connection established (${target})`);
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
