const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function deleteRecentStore() {
  try {
    console.log('🗑️  Deleting most recent offline store...\n');

    // Get the most recent store
    const getRecentQuery = `
      SELECT store_id, store_name, table_name, created_at
      FROM offline_stores
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const recentResult = await pool.query(getRecentQuery);

    if (recentResult.rows.length === 0) {
      console.log('✓ No stores found in database');
      await pool.end();
      return;
    }

    const store = recentResult.rows[0];
    console.log(`Found most recent store:`);
    console.log(`  Store ID: ${store.store_id}`);
    console.log(`  Store Name: ${store.store_name}`);
    console.log(`  Table Name: ${store.table_name}`);
    console.log(`  Created At: ${store.created_at}`);
    console.log('');

    // Delete the store's product table
    console.log(`Dropping product table: ${store.table_name}...`);
    const dropTableQuery = `DROP TABLE IF EXISTS ${store.table_name} CASCADE`;
    await pool.query(dropTableQuery);
    console.log(`✓ Dropped table: ${store.table_name}`);

    // Delete the store record
    console.log(`Deleting store record...`);
    const deleteStoreQuery = `DELETE FROM offline_stores WHERE store_id = $1`;
    await pool.query(deleteStoreQuery, [store.store_id]);
    console.log(`✓ Deleted store: ${store.store_name} (${store.store_id})`);

    console.log('\n✓ Successfully deleted the most recent offline store');

    await pool.end();
  } catch (error) {
    console.error('✗ Error deleting store:', error.message);
    process.exit(1);
  }
}

deleteRecentStore();
