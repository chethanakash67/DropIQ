require('dotenv').config();
const { pool } = require('./src/database/db');

async function cleanup() {
  const client = await pool.connect();
  try {
    console.log('Starting DB cleanup...');
    
    // List of tables to remove
    const tablesToRemove = [
      'asdfasdf_o',
      'bharath_electronics_o',
      'hello_world_o',
      'sai_videsh_digital_store_o',
      'siri_headphones_o'
    ];

    for (const table of tablesToRemove) {
      console.log(`Dropping table: ${table}`);
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }

    console.log('Cleanup completed successfully.');
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
