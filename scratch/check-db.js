const db = require('../src/database/db');

async function check() {
  const res = await db.query("SELECT product_name, price_inr FROM myntra_products WHERE price_inr > 1 LIMIT 5");
  console.log('Rows with price > 1:', res.rowCount);
  res.rows.forEach(r => {
      console.log(`- ${r.product_name}: ₹${r.price_inr}`);
  });
}

check().finally(() => db.pool.end());
