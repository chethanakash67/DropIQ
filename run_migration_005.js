require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./src/database/db');

async function runSpecificMigration(file) {
  const client = await pool.connect();
  try {
    console.log(`Running migration: ${file}`);
    const migrationSQL = fs.readFileSync(file, 'utf-8');
    await client.query(migrationSQL);
    console.log(`✓ Migration ${file} completed`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

const migrationPath = path.join(__dirname, 'src', 'database', 'migrations', '005_personalized_history.sql');
runSpecificMigration(migrationPath);
