const db = require('./db');

async function addBrandColumn() {
  try {
    console.log('Adding brand column to tables...');

    // Add brand column to amazon_products
    await db.query(`
      ALTER TABLE amazon_products 
      ADD COLUMN IF NOT EXISTS brand TEXT;
    `);
    console.log('✓ Brand column added to amazon_products');

    // Add brand column to flipkart_products
    await db.query(`
      ALTER TABLE flipkart_products 
      ADD COLUMN IF NOT EXISTS brand TEXT;
    `);
    console.log('✓ Brand column added to flipkart_products');

    console.log('\n✓ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

addBrandColumn();
