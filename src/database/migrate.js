require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Starting database migration...');

    // Run main schema
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );

    await client.query(schemaSQL);
    console.log('✓ Main schema created');

    // Run migrations in order
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensures migrations run in order (001, 002, etc.)

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migrationSQL = fs.readFileSync(
        path.join(migrationsDir, file),
        'utf-8'
      );
      await client.query(migrationSQL);
      console.log(`✓ Migration ${file} completed`);
    }

    console.log('✓ Migration completed successfully');
    console.log('✓ Tables created: amazon_products, flipkart_products, samsung_products, sony_products, search_history, offline_stores');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = migrate;
