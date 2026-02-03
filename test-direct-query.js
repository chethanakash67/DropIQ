const db = require('./src/database/db');

async function testDirectQuery() {
  console.log('=== Testing Direct Brand Queries ===\n');

  // Test Sony
  console.log('1. Sony products in database:');
  const sonyAll = await db.query(`SELECT product_name, brand, category FROM sony_products LIMIT 5`);
  sonyAll.rows.forEach(p => console.log(`  - ${p.brand} | ${p.product_name}`));

  console.log('\n2. Samsung products in database:');
  const samsungAll = await db.query(`SELECT product_name, brand, category FROM samsung_products LIMIT 5`);
  samsungAll.rows.forEach(p => console.log(`  - ${p.brand} | ${p.product_name}`));

  console.log('\n3. Testing WHERE clause with "sony earbuds":');
  const sonySearch = await db.query(`
    SELECT product_name, brand, category FROM sony_products 
    WHERE product_name ILIKE '%sony%' OR product_name ILIKE '%earbuds%' 
       OR brand ILIKE '%sony%' OR category ILIKE '%earbuds%'
    LIMIT 5
  `);
  console.log(`Found: ${sonySearch.rows.length} products`);
  sonySearch.rows.forEach(p => console.log(`  - ${p.brand} | ${p.product_name}`));

  await db.pool.end();
  process.exit(0);
}

testDirectQuery().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
