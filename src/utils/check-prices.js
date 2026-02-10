const db = require('../database/db');

async function checkPrices() {
  const result = await db.query(`
    SELECT product_name, price_inr, category 
    FROM amazon_products 
    WHERE category ILIKE '%earbud%' 
    LIMIT 10
  `);
  
  console.log('Sample earbuds with prices:');
  result.rows.forEach(r => {
    console.log(`${r.product_name.substring(0, 50).padEnd(50)} | ₹${r.price_inr} | ${r.category}`);
  });
  
  process.exit(0);
}

checkPrices();
