require('dotenv').config();
const ProductRepository = require('../src/repositories/product-repository');

async function testSearch() {
  const query = 'boAt';
  console.log(`Searching for: ${query} (Retailer: Myntra)`);
  const products = await ProductRepository.searchProducts({ searchTerm: query, retailer: 'Myntra' });
  
  console.log(`Found ${products.length} products.`);
  if (products.length > 0) {
      console.log('Example Myntra Product:', JSON.stringify(products[0], null, 2));
  }
}

testSearch().finally(() => require('../src/database/db').pool.end());
