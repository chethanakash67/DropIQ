require('dotenv').config();
const { pool } = require('./db');

async function addBrandToSamsung() {
  const client = await pool.connect();

  try {
    console.log('Adding brand column to samsung_products table...');

    // Check if table exists first
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'samsung_products'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log('samsung_products table does not exist. Creating it...');

      const createTable = `
        CREATE TABLE IF NOT EXISTS samsung_products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_name TEXT NOT NULL,
          brand TEXT DEFAULT 'Samsung',
          product_id TEXT,
          category TEXT NOT NULL CHECK (category IN ('headphones', 'earbuds', 'neckbands', 'wired_earphones', 'robot_vacuums')),
          price_inr DECIMAL NOT NULL CHECK (price_inr >= 0),
          rating NUMERIC(2,1) CHECK (rating >= 0.0 AND rating <= 5.0),
          reviews_count INTEGER,
          description TEXT,
          features JSONB,
          specifications JSONB,
          image_url TEXT,
          product_url TEXT,
          availability_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'out_of_stock', 'archived')),
          last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
          UNIQUE(product_name)
        );
        
        CREATE INDEX IF NOT EXISTS idx_samsung_category ON samsung_products(category);
        CREATE INDEX IF NOT EXISTS idx_samsung_product_name ON samsung_products(product_name);
        CREATE INDEX IF NOT EXISTS idx_samsung_price ON samsung_products(price_inr);
        CREATE INDEX IF NOT EXISTS idx_samsung_rating ON samsung_products(rating);
        CREATE INDEX IF NOT EXISTS idx_samsung_availability ON samsung_products(availability_status);
      `;

      await client.query(createTable);
      console.log('✓ samsung_products table created with brand column');
    } else {
      // Table exists, just add brand column if missing
      await client.query(`
        ALTER TABLE samsung_products 
        ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Samsung';
      `);
      console.log('✓ brand column added to samsung_products table');
    }

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  addBrandToSamsung()
    .then(() => {
      console.log('✓ Done');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = addBrandToSamsung;
