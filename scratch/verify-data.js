require('dotenv').config();
const db = require('../src/database/db');

async function run() {
  const tables = await db.query("SELECT tablename FROM pg_tables WHERE tablename LIKE '%products%' AND schemaname = 'public'");
  console.log('Product tables:', tables.rows.map(r => r.tablename));
  
  for (const t of tables.rows) {
    const count = await db.query('SELECT COUNT(*) as c FROM ' + t.tablename);
    console.log(`  ${t.tablename}: ${count.rows[0].c} rows`);
  }

  // Check Myntra features
  const myntraFeatures = await db.query("SELECT product_name, features FROM myntra_products WHERE features IS NOT NULL LIMIT 3");
  console.log('\nMyntra products with features:');
  myntraFeatures.rows.forEach(r => {
    console.log(`  - ${r.product_name}: ${JSON.stringify(r.features).substring(0, 100)}...`);
  });

  // Check Headphones Zone features
  const hzFeatures = await db.query("SELECT product_name, features FROM headphones_zone_products WHERE features IS NOT NULL LIMIT 3");
  console.log('\nHeadphones Zone products with features:');
  hzFeatures.rows.forEach(r => {
    console.log(`  - ${r.product_name}: ${JSON.stringify(r.features).substring(0, 100)}...`);
  });

  db.pool.end();
}

run();
