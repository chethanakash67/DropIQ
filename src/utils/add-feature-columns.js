const db = require('../database/db');

async function addFeatureColumns() {
  try {
    console.log('🔧 Adding feature columns to database...\n');
    
    const tables = ['amazon_products', 'flipkart_products', 'samsung_products', 'sony_products'];
    
    for (const table of tables) {
      console.log(`Processing ${table}...`);
      
      await db.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS has_anc BOOLEAN DEFAULT false
      `);
      
      await db.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS battery_hours INTEGER DEFAULT 0
      `);
      
      await db.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS has_fast_charge BOOLEAN DEFAULT false
      `);
      
      await db.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS mic_quality_score DECIMAL(3,2) DEFAULT 0.5
      `);
      
      await db.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS has_app_support BOOLEAN DEFAULT false
      `);
      
      await db.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS color VARCHAR(50)
      `);
      
      await db.query(`
        ALTER TABLE ${table} 
        ADD COLUMN IF NOT EXISTS design_style VARCHAR(50)
      `);
      
      console.log(`✅ Added columns to ${table}\n`);
    }
    
    console.log('🎉 All feature columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addFeatureColumns();
