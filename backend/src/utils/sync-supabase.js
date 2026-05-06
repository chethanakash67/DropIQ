require('dotenv').config();
const { pool } = require('../database/db');

const DEFAULT_TABLES = [
  'users',
  'amazon_products',
  'flipkart_products',
  'samsung_products',
  'sony_products',
  'croma_products',
  'vijay_sales_products',
  'tatacliq_products',
  'myntra_products',
  'zebronics_products',
  'offline_stores',
  'search_history',
  'cart_items',
  'bag_items',
  'refresh_tokens',
  'login_attempts',
];

const BATCH_SIZE = Number(process.env.SUPABASE_SYNC_BATCH_SIZE || 500);
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const pullOnly = args.has('--pull-only');
const pushOnly = args.has('--push-only');

function quoteIdent(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function getSyncTables() {
  if (!process.env.SUPABASE_SYNC_TABLES) return DEFAULT_TABLES;
  return process.env.SUPABASE_SYNC_TABLES
    .split(',')
    .map((table) => table.trim())
    .filter(Boolean);
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    ...extra,
  };
}

async function requestSupabase(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: supabaseHeaders(options.headers || {}),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Supabase ${response.status} ${response.statusText}: ${body}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function getLocalTables(client) {
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  `);
  return new Set(rows.map((row) => row.table_name));
}

async function getPrimaryKeys(client) {
  const { rows } = await client.query(`
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.ordinal_position
  `);

  return rows.reduce((acc, row) => {
    if (!acc[row.table_name]) acc[row.table_name] = [];
    acc[row.table_name].push(row.column_name);
    return acc;
  }, {});
}

async function getLocalColumns(client, table) {
  const { rows } = await client.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [table]
  );
  return new Set(rows.map((row) => row.column_name));
}

function filterRow(row, columns) {
  return Object.fromEntries(
    Object.entries(row).filter(([key, value]) => columns.has(key) && value !== undefined)
  );
}

async function fetchSupabaseRows(table) {
  const rows = [];
  for (let offset = 0; ; offset += BATCH_SIZE) {
    const path = `${encodeURIComponent(table)}?select=*&limit=${BATCH_SIZE}&offset=${offset}`;
    const batch = await requestSupabase(path);
    if (!Array.isArray(batch) || batch.length === 0) break;
    rows.push(...batch);
    if (batch.length < BATCH_SIZE) break;
  }
  return rows;
}

async function upsertLocalRows(client, table, rows, columns, primaryKeys) {
  if (rows.length === 0) return 0;
  if (!primaryKeys.length) return 0;

  let changed = 0;
  for (const row of rows) {
    const clean = filterRow(row, columns);
    const keys = Object.keys(clean);
    if (keys.length === 0 || primaryKeys.some((key) => clean[key] === undefined || clean[key] === null)) continue;

    const values = keys.map((key) => clean[key]);
    const inserts = keys.map(quoteIdent).join(', ');
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const conflict = primaryKeys.map(quoteIdent).join(', ');
    const updateKeys = keys.filter((key) => !primaryKeys.includes(key));
    const updateClause = updateKeys.length
      ? `DO UPDATE SET ${updateKeys.map((key) => `${quoteIdent(key)} = EXCLUDED.${quoteIdent(key)}`).join(', ')}`
      : 'DO NOTHING';

    if (!dryRun) {
      await client.query(
        `INSERT INTO ${quoteIdent(table)} (${inserts}) VALUES (${placeholders}) ON CONFLICT (${conflict}) ${updateClause}`,
        values
      );
    }
    changed += 1;
  }

  if (!dryRun && primaryKeys.length === 1 && primaryKeys[0] === 'id') {
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence($1, 'id'),
        COALESCE((SELECT MAX(id) FROM ${quoteIdent(table)}), 1),
        true
      )
      WHERE pg_get_serial_sequence($1, 'id') IS NOT NULL
    `, [table]);
  }

  return changed;
}

async function fetchLocalRows(client, table) {
  const rows = [];
  for (let offset = 0; ; offset += BATCH_SIZE) {
    const { rows: batch } = await client.query(
      `SELECT * FROM ${quoteIdent(table)} ORDER BY id LIMIT $1 OFFSET $2`,
      [BATCH_SIZE, offset]
    );
    if (batch.length === 0) break;
    rows.push(...batch);
    if (batch.length < BATCH_SIZE) break;
  }
  return rows;
}

async function upsertSupabaseRows(table, rows, primaryKeys) {
  if (rows.length === 0) return 0;
  if (!primaryKeys.length) return 0;

  let changed = 0;
  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    if (!dryRun) {
      await requestSupabase(`${encodeURIComponent(table)}?on_conflict=${primaryKeys.join(',')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal,missing=default',
        },
        body: JSON.stringify(batch),
      });
    }
    changed += batch.length;
  }
  return changed;
}

async function syncTable(client, table, primaryKeys) {
  const columns = await getLocalColumns(client, table);
  const result = {
    table,
    pulled: 0,
    pushed: 0,
    skipped: false,
    error: null,
  };

  try {
    if (!pushOnly) {
      const remoteRows = await fetchSupabaseRows(table);
      result.pulled = await upsertLocalRows(client, table, remoteRows, columns, primaryKeys);
    }

    if (!pullOnly) {
      const localRows = await fetchLocalRows(client, table);
      const cleanRows = localRows.map((row) => filterRow(row, columns));
      result.pushed = await upsertSupabaseRows(table, cleanRows, primaryKeys);
    }
  } catch (error) {
    result.error = error.message;
    if (error.status === 404) result.skipped = true;
  }

  return result;
}

async function main() {
  const tables = getSyncTables();
  const client = await pool.connect();

  try {
    const localTables = await getLocalTables(client);
    const primaryKeysByTable = await getPrimaryKeys(client);
    const results = [];

    console.log(`${dryRun ? 'Dry run: ' : ''}Syncing ${tables.length} tables with Supabase...`);

    for (const table of tables) {
      if (!localTables.has(table)) {
        results.push({ table, skipped: true, pulled: 0, pushed: 0, error: 'Local table not found' });
        continue;
      }

      const primaryKeys = primaryKeysByTable[table] || [];
      if (primaryKeys.length === 0) {
        results.push({ table, skipped: true, pulled: 0, pushed: 0, error: 'Primary key not found' });
        continue;
      }

      const result = await syncTable(client, table, primaryKeys);
      results.push(result);
      const status = result.error ? `error: ${result.error}` : `pulled ${result.pulled}, pushed ${result.pushed}`;
      console.log(`${table}: ${status}`);
    }

    const failed = results.filter((result) => result.error && !result.skipped);
    if (failed.length) {
      process.exitCode = 1;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Supabase sync failed:', error);
    process.exit(1);
  });
}
