require('dotenv').config();
const sovrnRecommendations = require('./src/services/sovrn-recommendations');
const db = require('./src/database/db');

async function testRecommendations() {
  try {
    // Get a sample product
    const result = await db.query(`
      SELECT id, product_name, category, price_inr, description 
      FROM amazon_products 
      WHERE product_name ILIKE '%samsung%' OR product_name ILIKE '%earbuds%'
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('No products found');
      process.exit(1);
    }

    const product = result.rows[0];
    console.log('\n========================================');
    console.log('Testing Product Recommendations');
    console.log('========================================\n');
    console.log('Product:', product.product_name);
    console.log('Category:', product.category);
    console.log('Price:', `₹${product.price_inr}`);
    console.log('ID:', product.id);
    console.log('\nFetching recommendations...\n');

    // Fetch recommendations
    const recommendations = await sovrnRecommendations.getRecommendations(product, product.id);

    console.log('\n========================================');
    console.log(`Found ${recommendations.length} recommendations:`);
    console.log('========================================\n');

    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.name}`);
      console.log(`   Price: ₹${rec.price_inr || 'N/A'}`);
      console.log(`   Merchant: ${rec.merchant}`);
      console.log(`   URL: ${rec.product_url}`);
      console.log(`   Affiliate: ${rec.affiliate_url ? 'Yes' : 'No'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testRecommendations();
