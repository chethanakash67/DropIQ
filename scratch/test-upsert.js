const db = require('../src/database/db');
const ProductRepository = require('../src/repositories/product-repository');

async function test() {
  const data = {
    productName: 'Test Product ' + Date.now(),
    brand: 'Test Brand',
    priceInr: 449.00,
    productUrl: 'https://test.com',
    imageUrl: 'https://test.com/img.jpg',
    category: 'Test'
  };
  
  console.log('Upserting:', data);
  const result = await ProductRepository.upsertMyntraProduct(data);
  console.log('Result:', result);
  
  const check = await db.query('SELECT * FROM myntra_products WHERE id = $1', [result.id]);
  console.log('DB Row Price:', check.rows[0].price_inr);
}

test().finally(() => db.pool.end());
