require('dotenv').config();
const BrowseAiClient = require('../services/browseai-client');
const ProductRepository = require('../repositories/product-repository');
const db = require('../database/db');
const axios = require('axios');

async function runListScraper(client) {
  try {
    let task;
    try {
      task = await client.runRobot({});
    } catch (triggerErr) {
      console.warn('⚠️ Failed to trigger new task, attempting to fetch latest successful task instead.');
    }

    if (!task) {
      console.log('Fetching latest successful task data...');
      return await client.fetchTaskData();
    }

    let status = task.status;
    let data;
    let attempts = 0;
    while (status !== 'successful' && status !== 'failed' && attempts < 40) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      try {
        const url = `https://api.browse.ai/v2/robots/${client.robotId}/tasks/${task.id}`;
        const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${client.apiKey}` } });
        status = res.data.result.status;
        data = res.data;
      } catch (err) {
        console.warn(`Attempt ${attempts+1} failed to poll task status: ${err.message}`);
      }
      attempts++;
    }

    if (status === 'successful') {
      return data.result.capturedLists;
    } else {
      console.warn(`⚠️ Task ${task.id} ended with status: ${status}. Falling back to latest successful task.`);
      return await client.fetchTaskData();
    }
  } catch (err) {
    console.error(`Error in Myntra list scraper:`, err.message);
    return null;
  }
}

async function runDetailScraper(client, productUrl) {
  try {
    let task;
    try {
      task = await client.runRobot({ "OriginUrl": productUrl });
    } catch (triggerErr) {
      console.warn(`⚠️ Failed to trigger detail task for ${productUrl}. Searching task history...`);
    }

    if (!task) {
        // Search through task history for a task that was run with this specific URL
        try {
          const tasksUrl = `https://api.browse.ai/v2/robots/${client.robotId}/tasks?limit=50&status=successful`;
          const tasksRes = await axios.get(tasksUrl, { 
            headers: { 'Authorization': `Bearer ${client.apiKey}`, 'Content-Type': 'application/json' } 
          });
          const tasks = tasksRes.data?.result?.robotTasks?.items || tasksRes.data?.result?.items || [];
          
          // Find a task whose input parameters match our URL
          for (const t of tasks) {
            const inputUrl = t.inputParameters?.OriginUrl || t.inputParameters?.originUrl || '';
            if (inputUrl === productUrl || productUrl.includes(inputUrl) || inputUrl.includes(productUrl)) {
              console.log(`   ✓ Found matching historical task: ${t.id}`);
              const detailUrl = `https://api.browse.ai/v2/robots/${client.robotId}/tasks/${t.id}`;
              const detailRes = await axios.get(detailUrl, { 
                headers: { 'Authorization': `Bearer ${client.apiKey}` } 
              });
              if (detailRes.data.result?.capturedTexts) {
                return detailRes.data.result.capturedTexts;
              }
            }
          }
          console.log(`   ✗ No matching historical task found for URL`);
        } catch (searchErr) {
          console.warn(`   ✗ Error searching task history: ${searchErr.message}`);
        }
        return null; 
    }

    let status = task.status;
    let data;
    let attempts = 0;
    while (status !== 'successful' && status !== 'failed' && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      try {
        const url = `https://api.browse.ai/v2/robots/${client.robotId}/tasks/${task.id}`;
        const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${client.apiKey}` } });
        status = res.data.result.status;
        data = res.data;
      } catch (err) {
        console.warn(`Attempt ${attempts+1} failed to poll detail task status: ${err.message}`);
      }
      attempts++;
    }

    if (status === 'successful') {
      return data.result.capturedTexts;
    }
    return null;
  } catch (err) {
    console.error(`Error scraping Myntra details ${productUrl}:`, err.message);
    return null;
  }
}

async function ingestMyntraFull() {
  console.log('\n========================================');
  console.log('Myntra Full Integration (List + Detail)');
  console.log('========================================\n');

  try {
    const apiKey = process.env.BROWSEAI_MYNTRA_API_KEY || '1c87fb33-afb3-45aa-9731-f6b66f32415d:27e5d709-301c-477f-8019-0ff81badc8a7';
    const listRobotId = '019dd940-a482-76b0-8ce6-660657a001a4';
    const detailRobotId = '019dd945-0bb2-7ebf-a1be-72236e48acb7';

    const listClient = new BrowseAiClient(apiKey, listRobotId);
    const detailClient = new BrowseAiClient(apiKey, detailRobotId);

    console.log('1. Running Myntra List Scraper...');
    const listData = await runListScraper(listClient);
    
    if (listData) {
      const lists = Object.values(listData);
      const items = lists.length > 0 ? lists[0] : [];
      console.log(`Found ${items.length} products from List Scraper.`);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Match actual Myntra Robot field names
        const priceRaw = item['Discounted Price'] || item.Price || item.price || '';
        let price = priceRaw ? parseFloat(priceRaw.replace(/[^0-9.]/g, '')) : null;
        if (isNaN(price)) price = null;

        const name = item['Product Name'] || item.ProductName || item.Title || 'Unknown Myntra Product';
        const url = item['Product Link'] || item.ProductLink || item.OriginUrl || item.URL;
        const image = item['Product Image'] || item.ImageUrl || item.Image;

        if (!url) continue;

        const ratingRaw = item['Rating'] || item.Rating || item.rating || '';
        let rating = ratingRaw ? parseFloat(ratingRaw.replace(/[^0-9.]/g, '')) : null;
        if (isNaN(rating) || rating > 5) rating = null;

        const description = item['Product Description'] || item.Description || '';

        const baseData = {
          productName: name,
          brand: item.Brand || 'Myntra', 
          category: 'Fashion/Electronics',
          priceInr: price,
          rating: rating,
          description: description,
          productUrl: url,
          imageUrl: image,
          availabilityStatus: 'in_stock'
        };

        await ProductRepository.upsertMyntraProduct(baseData);
      }
    } else {
      console.log('Warning: No list data captured. Using existing DB records for details pass.');
    }

    // 2. Details Scraper pass
    const res = await db.query('SELECT * FROM myntra_products WHERE product_url IS NOT NULL');
    const products = res.rows;
    console.log(`\n2. Running Details Scraper for ${products.length} products...`);

    let enriched = 0;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`[${i+1}/${products.length}] Fetching details for: ${p.product_name}`);
      
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

        // Extract features from detail robot's Details field
        const detailsText = detailData['Details'] || detailData['Description'] || '';
        let featuresList = [];
        if (detailsText) {
          // Parse features from the Details text - look for "Features:" section
          const featuresMatch = detailsText.match(/Features:?\s*([\s\S]*?)(?=\n\n|Warranty:|General Specifications|Brand customer|$)/i);
          if (featuresMatch) {
            const featureLines = featuresMatch[1].split('\n').map(l => l.replace(/^[\s\-•*]+/, '').trim()).filter(l => l.length > 0);
            featuresList = featureLines;
          } else {
            // If no explicit Features section, use the whole Details as features
            const lines = detailsText.split('\n').map(l => l.replace(/^[\s\-•*]+/, '').trim()).filter(l => l.length > 0 && !l.startsWith('PRODUCT DETAILS'));
            featuresList = lines.slice(0, 10); // Take first 10 meaningful lines
          }
        }

        // Also add key specs as features
        if (detailData['Connectivity']) featuresList.push(`Connectivity: ${detailData['Connectivity']}`);
        if (detailData['Type']) featuresList.push(`Type: ${detailData['Type']}`);
        if (detailData['Microphone']) featuresList.push(`Microphone: ${detailData['Microphone']}`);

        const updateData = {
          productName: p.product_name,
          brand: detailData['Brand'] || detailData['brand'] || p.brand || 'Myntra',
          productId: detailData['SKU'] || detailData['Model'] || p.product_id,
          category: detailData['Category'] || detailData['Type'] || p.category,
          priceInr: p.price_inr,
          rating: p.rating,
          reviewsCount: p.reviews_count,
          description: detailsText || p.description,
          features: featuresList.length > 0 ? featuresList : p.features,
          specifications: mergedSpecs,
          imageUrl: detailData['Image'] || detailData['ImageUrl'] || p.image_url,
          productUrl: p.product_url,
          affiliateUrl: p.affiliate_url,
          availabilityStatus: p.availability_status,
          color: detailData['Color'] || detailData['Colour'] || p.color
        };

        await ProductRepository.upsertMyntraProduct(updateData);
        console.log(`   ✓ Updated DB with Myntra detail features`);
        enriched++;
      } else {
        console.log(`   ✗ Failed or timed out`);
      }
    }

    console.log('\n========================================');
    console.log(`Completed. Enriched ${enriched}/${products.length} Myntra products.`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Fatal Error:', error.message);
  }
}

if (require.main === module) {
  ingestMyntraFull().finally(() => db.pool.end());
}

module.exports = ingestMyntraFull;
