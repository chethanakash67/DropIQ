const db = require('../database/db');

async function calculateCategoryMedians() {
  try {
    console.log('📊 Calculating category median prices...\n');
    
    const tables = ['amazon_products', 'flipkart_products', 'samsung_products', 'sony_products'];
    const categories = ['earbuds', 'headphones', 'neckbands', 'earphones'];
    
    const medians = {};
    
    for (const category of categories) {
      console.log(`\nCalculating median for ${category}...`);
      
      // Get all prices for this category across all tables
      const prices = [];
      
      for (const table of tables) {
        const result = await db.query(`
          SELECT price_inr
          FROM ${table}
          WHERE category ILIKE $1
            AND price_inr IS NOT NULL
            AND price_inr > 0
          ORDER BY price_inr
        `, [`%${category}%`]);
        
        prices.push(...result.rows.map(r => parseFloat(r.price_inr)));
      }
      
      if (prices.length === 0) {
        console.log(`  ⚠️ No products found for ${category}`);
        continue;
      }
      
      // Sort prices
      prices.sort((a, b) => a - b);
      
      // Calculate median
      const mid = Math.floor(prices.length / 2);
      const median = prices.length % 2 !== 0
        ? prices[mid]
        : (prices[mid - 1] + prices[mid]) / 2;
      
      medians[category] = Math.round(median);
      console.log(`  Products found: ${prices.length}`);
      console.log(`  Median price: ₹${medians[category]}`);
      console.log(`  Price range: ₹${prices[0]} - ₹${prices[prices.length - 1]}`);
    }
    
    console.log('\n\n📋 Category Median Prices Summary:');
    console.log('================================');
    for (const [category, median] of Object.entries(medians)) {
      console.log(`${category.padEnd(15)}: ₹${median}`);
    }
    
    // Save to a config file for later use
    const fs = require('fs');
    const configPath = 'src/config/category-medians.json';
    fs.writeFileSync(configPath, JSON.stringify(medians, null, 2));
    console.log(`\n✅ Saved to ${configPath}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error calculating medians:', error);
    process.exit(1);
  }
}

calculateCategoryMedians();
