require('dotenv').config();
const { pool } = require('./db');

async function recreateSamsungTable() {
  const client = await pool.connect();

  try {
    console.log('Dropping and recreating samsung_products table...');

    // Drop the table
    await client.query('DROP TABLE IF EXISTS samsung_products CASCADE;');
    console.log('✓ Dropped existing table');

    // Create table with all columns
    const createTable = `
      CREATE TABLE samsung_products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_name TEXT NOT NULL,
        brand TEXT DEFAULT 'Samsung',
        product_id TEXT,
        category TEXT NOT NULL CHECK (category IN ('headphones', 'earbuds', 'neckbands', 'wired_earphones', 'robot_vacuums')),
        price_inr DECIMAL CHECK (price_inr >= 0),
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
      
      CREATE INDEX idx_samsung_category ON samsung_products(category);
      CREATE INDEX idx_samsung_product_name ON samsung_products(product_name);
      CREATE INDEX idx_samsung_price ON samsung_products(price_inr);
      CREATE INDEX idx_samsung_rating ON samsung_products(rating);
      CREATE INDEX idx_samsung_availability ON samsung_products(availability_status);
    `;

    await client.query(createTable);
    console.log('✓ samsung_products table created successfully with all columns');

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
  recreateSamsungTable()
    .then(() => {
      console.log('✓ Done');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = recreateSamsungTable;
