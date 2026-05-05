require('dotenv').config();
const BrowseAiClient = require('../services/browseai-client');
const ProductRepository = require('../repositories/product-repository');
const db = require('../database/db');
const axios = require('axios');

function determineCategory(productName) {
  const text = productName.toLowerCase();
  if (text.includes('earbud') || text.includes('buds') || text.includes('tws')) return 'earbuds';
  if (text.includes('neckband')) return 'neckbands';
  if (text.includes('wired') && (text.includes('earphone') || text.includes('headphone'))) return 'wired_earphones';
  if (text.includes('headphone')) return 'headphones';
  if (text.includes('vacuum') || text.includes('robot')) return 'robot_vacuums';
  return 'earbuds'; // default
}

function normalizeTataCliqProduct(item) {
  const productName = item['Product Name'] || '';
  const category = determineCategory(productName);
  
  // Extract price
  let priceInr = null;
  const priceField = item['Current Price'] || item['Product Price'] || item['price'];
  if (priceField) {
    const match = String(priceField).match(/[\d,]+/);
    if (match) {
      priceInr = parseFloat(match[0].replace(/,/g, ''));
    }
  }

  // Extract rating
  let rating = null;
  const ratingField = item['Rating'];
  if (ratingField) {
    const match = String(ratingField).match(/[\d.]+/);
    if (match) {
      rating = parseFloat(match[0]);
    }
  }

  // Extract reviews count
  let reviewsCount = null;
  const reviewsField = item['Number of Reviews'];
  if (reviewsField) {
    const match = String(reviewsField).match(/[\d,]+/);
    if (match) {
      reviewsCount = parseInt(match[0].replace(/,/g, ''));
    }
  }

  const features = [];
  if (item['Discount']) features.push(`Discount: ${item['Discount']}`);

  return {
    productName,
    brand: item['Brand'] || 'TataCliq',
    productId: item['SKU'] || item['Position'] || null,
    category,
    priceInr,
    rating,
    reviewsCount,
    description: null,
    features,
    specifications: null,
    imageUrl: item['Product Image'] || null,
    productUrl: item['Product Link'] || item['Product URL'] || null,
    availabilityStatus: 'in_stock'
  };
}

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

async function ingestTataCliqFull() {
  console.log('\n========================================');
  console.log('TataCliq Full Integration (List + Detail)');
  console.log('========================================\n');

  try {
    // 1. Fetch from List Robot (Using latest task since user ran it on dashboard)
    const apiKey = process.env.BROWSEAI_TATACLIQ_API_KEY || process.env.BROWSEAI_API_KEY;
    const listRobotId = process.env.BROWSEAI_TATACLIQ_ROBOT_ID;
    const listClient = new BrowseAiClient(apiKey, listRobotId);
    
    console.log('Fetching list data from latest successful task...');
    const rawData = await listClient.fetchTaskData();
    
    let products = [];
    if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
      const listNames = Object.keys(rawData);
      if (listNames.length > 0) {
        products = rawData[listNames[0]];
      }
    } else if (Array.isArray(rawData)) {
      products = rawData;
    }

    console.log(`Found ${products.length} TataCliq products from List Robot\n`);

    // 2. Insert Base List Data into DB
    for (const item of products) {
      const normalized = normalizeTataCliqProduct(item);
      if (normalized.productName) {
         await ProductRepository.upsertTataCliqProduct(normalized);
      }
    }

    // 3. Fetch from Detail Robot
    const res = await db.query('SELECT * FROM tatacliq_products WHERE product_url IS NOT NULL');
    const dbProducts = res.rows;
    console.log(`Found ${dbProducts.length} products in DB to enrich.`);

    const detailRobotId = process.env.BROWSEAI_TATACLIQ_DETAIL_ROBOT_ID;
    const detailClient = new BrowseAiClient(apiKey, detailRobotId);

    let enriched = 0;
    
    for (let i = 0; i < dbProducts.length; i++) {
      const p = dbProducts[i];
      console.log(`[${i+1}/${dbProducts.length}] Fetching details for: ${p.product_name}`);
      
      const detailData = await runDetailScraper(detailClient, p.product_url);
      if (detailData) {
        let existingSpecs = {};
        if (p.specifications) {
            existingSpecs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
        }
        
        const mergedSpecs = {
            ...existingSpecs,
            ...detailData
        };

        const updateData = {
          productName: p.product_name,
          brand: detailData['Brand'] || p.brand || 'TataCliq',
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

        await ProductRepository.upsertTataCliqProduct(updateData);
        console.log(`   ✓ Updated DB with TataCliq detail features`);
        enriched++;
      } else {
        console.log(`   ✗ Failed or timed out`);
      }
    }

    console.log('\n========================================');
    console.log(`Completed. Enriched ${enriched}/${dbProducts.length} TataCliq products.`);
    console.log('You can now run "npm run export:table -t tatacliq_products" to get the excel.');
    console.log('========================================\n');

  } catch (error) {
    console.error('Fatal Error:', error);
  }
}

if (require.main === module) {
  ingestTataCliqFull().finally(() => db.pool.end());
}

module.exports = ingestTataCliqFull;
