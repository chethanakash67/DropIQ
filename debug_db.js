require('dotenv').config();
const { pool } = require('./src/database/db');

async function debugHistory() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM search_history ORDER BY last_searched_at DESC LIMIT 20');
    console.log('--- ALL SEARCH HISTORY ---');
    console.table(res.rows);
    
    const resUsers = await client.query('SELECT id, email FROM users LIMIT 5');
    console.log('\n--- RECENT USERS ---');
    console.table(resUsers.rows);
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

debugHistory();
