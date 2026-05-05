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

async function ingestVijaySalesFull() {
  console.log('\n========================================');
  console.log('Vijay Sales Full Integration (List + Detail)');
  console.log('========================================\n');

  try {
    // 1. Fetch current list of products from DB to get their URLs
    const res = await db.query('SELECT * FROM vijay_sales_products WHERE product_url IS NOT NULL');
    const products = res.rows;
    console.log(`Found ${products.length} products to enrich.`);

    const apiKey = process.env.BROWSEAI_VIJAYSALES_API_KEY;
    const detailRobotId = process.env.BROWSEAI_VIJAYSALES_DETAIL_ROBOT_ID;
    const detailClient = new BrowseAiClient(apiKey, detailRobotId);

    let enriched = 0;
    
    // Process sequentially to avoid rate limits
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`[${i+1}/${products.length}] Fetching details for: ${p.product_name}`);
      
      const detailData = await runDetailScraper(detailClient, p.product_url);
      if (detailData) {
        // Merge data
        const mergedFeatures = [];
        if (p.features) mergedFeatures.push(...(typeof p.features === 'string' ? JSON.parse(p.features) : p.features));
        if (detailData['Special Features']) mergedFeatures.push(`Special Features: ${detailData['Special Features']}`);
        if (detailData['Cable Feature']) mergedFeatures.push(`Cable: ${detailData['Cable Feature']}`);
        
        const mergedSpecs = {
            ...(typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {})),
            'Weight': detailData['PRODUCT WEIGHT'],
            'Dimensions': detailData['PRODUCT DIMENSIONS'],
            'Material': detailData['Material'],
            'Form Factor': detailData['Form Factor'],
            'Connectivity': detailData['Connectivity Technology']
        };

        const updateData = {
          productName: p.product_name,
          brand: detailData['BRAND'] || p.brand,
          productId: detailData['SKU'] || p.product_id,
          category: p.category,
          priceInr: p.price_inr,
          rating: p.rating,
          reviewsCount: p.reviews_count,
          description: p.description,
          features: mergedFeatures,
          specifications: mergedSpecs,
          imageUrl: p.image_url,
          productUrl: p.product_url,
          affiliateUrl: p.affiliate_url,
          availabilityStatus: p.availability_status,
          color: detailData['COLOR'] || p.color
        };

        await ProductRepository.upsertVijaySalesProduct(updateData);
        console.log(`   ✓ Updated DB with detail features`);
        enriched++;
      } else {
        console.log(`   ✗ Failed or timed out`);
      }
    }

    console.log('\n========================================');
    console.log(`Completed. Enriched ${enriched}/${products.length} products.`);
    console.log('You can now run "npm run export:table -t vijay_sales_products" to get the excel.');
    console.log('========================================\n');

  } catch (error) {
    console.error('Fatal Error:', error.message);
  }
}

if (require.main === module) {
  ingestVijaySalesFull().finally(() => db.pool.end());
}

module.exports = ingestVijaySalesFull;
