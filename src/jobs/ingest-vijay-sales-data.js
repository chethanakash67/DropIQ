require('dotenv').config();
const BrowseAiClient = require('../services/browseai-client');
const ProductRepository = require('../repositories/product-repository');

/**
 * Vijay Sales Data Ingestion Job
 */

function determineCategory(productName) {
  const text = productName.toLowerCase();
  if (text.includes('earbud') || text.includes('buds') || text.includes('tws')) return 'earbuds';
  if (text.includes('neckband')) return 'neckbands';
  if (text.includes('wired') && (text.includes('earphone') || text.includes('headphone'))) return 'wired_earphones';
  if (text.includes('headphone')) return 'headphones';
  return 'earbuds'; // default
}

function normalizeVijaySalesProduct(item) {
  const productName = item['Product Name'] || '';
  const category = determineCategory(productName);
  
  // Extract price
  let priceInr = null;
  const priceField = item['Discounted Price'] || item['Original Price'];
  if (priceField) {
    const match = String(priceField).match(/[\d,]+/);
    if (match) {
      priceInr = parseFloat(match[0].replace(/,/g, ''));
    }
  }

  // Specifications
  const specifications = {
    'Original Price': item['Original Price'] || null,
    'Discount': item['Discount Percentage'] || null,
    'Delivery Details': item['Delivery Details'] || null,
    'Position': item['Position'] || null
  };

  const features = [];
  if (item['Discount Percentage']) features.push(`Discount: ${item['Discount Percentage']}`);
  if (item['Delivery Details']) features.push(`Delivery: ${item['Delivery Details']}`);

  return {
    productName,
    brand: 'Vijay Sales',
    productId: item['Position'] || null,
    category,
    priceInr,
    rating: null,
    reviewsCount: null,
    description: item['Delivery Details'] || null,
    features,
    specifications,
    imageUrl: item['Product Image'] || null,
    productUrl: item['Product URL'] || null,
    availabilityStatus: item['Delivery Details']?.includes('Out of Stock') ? 'out_of_stock' : 'in_stock'
  };
}

async function ingestVijaySalesData(customTaskId = null) {
  console.log('\n========================================');
  console.log('Vijay Sales Data Ingestion (Browse.ai)');
  console.log('========================================\n');

  const startTime = Date.now();
  const stats = { total: 0, inserted: 0, errors: 0 };

  try {
    const apiKey = process.env.BROWSEAI_VIJAYSALES_API_KEY;
    const robotId = process.env.BROWSEAI_VIJAYSALES_ROBOT_ID;
    const taskId = customTaskId || process.env.BROWSEAI_VIJAYSALES_TASK_ID;

    const client = new BrowseAiClient(apiKey, robotId, taskId);
    const rawData = await client.fetchTaskData();

    let products = [];
    if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
      const listNames = Object.keys(rawData);
      if (listNames.length > 0) {
        products = rawData[listNames[0]];
      }
    }

    stats.total = products.length;
    console.log(`Found ${products.length} Vijay Sales products\n`);

    for (const item of products) {
      try {
        const product = normalizeVijaySalesProduct(item);
        if (!product.productName) continue;

        const result = await ProductRepository.upsertVijaySalesProduct(product);
        if (result.inserted) stats.inserted++;
        
        console.log(`✓ ${product.productName}`);
      } catch (err) {
        console.error(`✗ Error processing: ${item['Product Name']}`, err.message);
        stats.errors++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n========================================');
    console.log('Vijay Sales Ingestion Summary');
    console.log('========================================');
    console.log(`Total:      ${stats.total}`);
    console.log(`Inserted:   ${stats.inserted}`);
    console.log(`Errors:     ${stats.errors}`);
    console.log(`Duration:   ${duration}s`);
    console.log('========================================\n');

    return stats;

  } catch (error) {
    console.error('Fatal Error during Vijay Sales ingestion:', error.message);
    throw error;
  }
}

if (require.main === module) {
  ingestVijaySalesData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = ingestVijaySalesData;
