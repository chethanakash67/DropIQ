require('dotenv').config();
const { pool } = require('./src/database/db');

async function updateCredits() {
  const client = await pool.connect();
  try {
    console.log('Updating user credits...');
    
    // Update existing users to 20 credits if they have less (assuming they were on the old default)
    const res = await client.query('UPDATE users SET credits = 20 WHERE credits < 20');
    console.log(`Updated credits for ${res.rowCount} users.`);

  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateCredits();
