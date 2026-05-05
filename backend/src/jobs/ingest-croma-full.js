require('dotenv').config();
const BrowseAiClient = require('../services/browseai-client');
const ProductRepository = require('../repositories/product-repository');
const db = require('../database/db');
const axios = require('axios');

async function runDetailScraper(client, productUrl) {
  try {
    const task = await client.runRobot({ "OriginUrl": productUrl });
    let status = task.status;
    let data;
    let attempts = 0;
    while (status !== 'successful' && status !== 'failed' && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const url = `https://api.browse.ai/v2/robots/${client.robotId}/tasks/${task.id}`;
      const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${client.apiKey}` } });
      status = res.data.result.status;
      data = res.data;
      attempts++;
    }
    if (status === 'successful') {
      return data.result.capturedTexts;
    }
    return null;
  } catch (err) {
    console.error(`Error scraping ${productUrl}:`, err.message);
    return null;
  }
}

async function ingestCromaFull() {
  console.log('\n========================================');
  console.log('Croma Full Integration (List + Detail)');
  console.log('========================================\n');

  try {
    // 1. Fetch current list of products from DB
    const res = await db.query('SELECT * FROM croma_products WHERE product_url IS NOT NULL');
    const products = res.rows;
    console.log(`Found ${products.length} products to enrich.`);

    // Use the main API key or CROMA specific one
    const apiKey = process.env.BROWSEAI_CROMA_API_KEY || process.env.BROWSEAI_API_KEY;
    const detailRobotId = process.env.BROWSEAI_CROMA_DETAIL_ROBOT_ID; // Croma Detail Robot
    const detailClient = new BrowseAiClient(apiKey, detailRobotId);

    let enriched = 0;
    
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`[${i+1}/${products.length}] Fetching details for: ${p.product_name}`);
      
      const detailData = await runDetailScraper(detailClient, p.product_url);
      if (detailData) {
        // Merge specs dynamically - take whatever the 2nd robot found
        let existingSpecs = {};
        if (p.specifications) {
            existingSpecs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
        }
        
        const mergedSpecs = {
            ...existingSpecs,
            ...detailData // Just dump all detail keys into specs
        };

        const updateData = {
          productName: p.product_name,
          brand: detailData['Brand'] || p.brand || 'Croma',
          productId: detailData['SKU'] || detailData['Model'] || p.product_id,
          category: p.category,
          priceInr: p.price_inr,
          rating: p.rating,
          reviewsCount: p.reviews_count,
          description: detailData['Description'] || p.description,
          features: p.features,
          specifications: mergedSpecs,
          imageUrl: p.image_url,
          productUrl: p.product_url,
          affiliateUrl: p.affiliate_url,
          availabilityStatus: p.availability_status,
          color: detailData['Color'] || detailData['Colour'] || p.color
        };

        await ProductRepository.upsertCromaProduct(updateData);
        console.log(`   ✓ Updated DB with Croma detail features`);
        enriched++;
      } else {
        console.log(`   ✗ Failed or timed out`);
      }
    }

    console.log('\n========================================');
    console.log(`Completed. Enriched ${enriched}/${products.length} Croma products.`);
    console.log('You can now run "npm run export:table -t croma_products" to get the excel.');
    console.log('========================================\n');

  } catch (error) {
    console.error('Fatal Error:', error.message);
  }
}

if (require.main === module) {
  ingestCromaFull().finally(() => db.pool.end());
}

module.exports = ingestCromaFull;
