const db = require('../src/database/db');

async function check() {
  const res = await db.query(`
    SELECT column_name, data_type, numeric_precision, numeric_scale
    FROM information_schema.columns
    WHERE table_name = 'myntra_products'
  `);
  console.log('Schema:', JSON.stringify(res.rows, null, 2));
}

check().finally(() => db.pool.end());
