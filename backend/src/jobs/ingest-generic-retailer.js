require('dotenv').config();
const BrowseAiClient = require('../services/browseai-client');
const ProductRepository = require('../repositories/product-repository');
const db = require('../database/db');
const axios = require('axios');

async function ensureTable(retailerName) {
  const tableName = `${retailerName.toLowerCase().replace(/\s+/g, '_')}_products`;
  console.log(`Ensuring table ${tableName} exists...`);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_name TEXT NOT NULL,
        brand TEXT,
        product_id TEXT,
        category TEXT,
        price_inr NUMERIC(12, 2),
        rating NUMERIC(3, 2),
        reviews_count INTEGER,
        description TEXT,
        features JSONB,
        specifications JSONB,
        image_url TEXT,
        product_url TEXT,
        affiliate_url TEXT,
        availability_status TEXT DEFAULT 'in_stock',
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        review_score NUMERIC(3,2) DEFAULT 0,
        brand_score NUMERIC(3,2) DEFAULT 0,
        feature_score NUMERIC(3,2) DEFAULT 0,
        has_anc BOOLEAN DEFAULT FALSE,
        battery_hours NUMERIC(5,2),
        has_fast_charge BOOLEAN DEFAULT FALSE,
        mic_quality_score NUMERIC(3,2) DEFAULT 0,
        has_app_support BOOLEAN DEFAULT FALSE,
        color TEXT,
        design_style TEXT,
        detected_category BOOLEAN DEFAULT FALSE,
        classified_tag TEXT,
        UNIQUE(product_name)
    )
  `);
  
  await db.query(`CREATE INDEX IF NOT EXISTS idx_${tableName}_name ON ${tableName}(product_name)`);
  return tableName;
}

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
    console.error(`Error in list scraper:`, err.message);
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
    console.error(`Error scraping details ${productUrl}:`, err.message);
    return null;
  }
}

async function upsertProduct(tableName, retailerName, data) {
    const columns = [
        'product_name', 'brand', 'product_id', 'category', 'price_inr', 'rating', 'reviews_count',
        'description', 'features', 'specifications', 'image_url', 'product_url', 'affiliate_url',
        'availability_status', 'last_updated'
    ];
    
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const updates = columns.slice(1).map(col => `${col} = EXCLUDED.${col}`).join(', ');

    const values = [
        data.productName,
        data.brand || retailerName,
        data.productId || null,
        data.category || 'General',
        data.priceInr || null,
        data.rating || null,
        data.reviewsCount || null,
        data.description || null,
        data.features ? JSON.stringify(data.features) : null,
        data.specifications ? JSON.stringify(data.specifications) : null,
        data.imageUrl || null,
        data.productUrl || null,
        data.affiliateUrl || null,
        data.availabilityStatus || 'in_stock',
        new Date()
    ];

    const query = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT (product_name) DO UPDATE SET ${updates}
        RETURNING id
    `;

    return await db.query(query, values);
}

async function ingestGenericRetailer(retailerName, listRobotId, detailRobotId) {
  console.log(`\n========================================`);
  console.log(`Ingesting ${retailerName}`);
  console.log(`List Robot: ${listRobotId}`);
  console.log(`Detail Robot: ${detailRobotId}`);
  console.log(`========================================\n`);

  try {
    const storeEnvKey = `BROWSEAI_${retailerName.toUpperCase().replace(/\s+/g, '')}_API_KEY`;
    const apiKey = process.env[storeEnvKey] || process.env.BROWSEAI_MYNTRA_API_KEY || process.env.BROWSEAI_API_KEY;
    if (!apiKey) throw new Error(`No Browse.ai API key found for ${retailerName} or generic keys in .env`);

    const tableName = await ensureTable(retailerName);
    const listClient = new BrowseAiClient(apiKey, listRobotId);
    const detailClient = new BrowseAiClient(apiKey, detailRobotId);

    console.log('1. Running List Scraper...');
    const listData = await runListScraper(listClient);
    
    if (listData) {
      const lists = Object.values(listData);
      const items = lists.length > 0 ? lists[0] : [];
      console.log(`Found ${items.length} products from List Scraper.`);
      if (items.length > 0) {
        console.log('Sample item keys:', Object.keys(items[0]));
        console.log('Sample item data:', JSON.stringify(items[0], null, 2));
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        const priceRaw = item['Discounted Price'] || item['Price'] || item['price'] || item['Current Price'] || '';
        let price = priceRaw ? parseFloat(priceRaw.replace(/[^0-9.]/g, '')) : null;
        if (isNaN(price)) price = null;

        const name = item['Product Name'] || item['ProductName'] || item['Title'] || item['Product Title'] || item['name'] || 'Unknown Product';
        const url = item['Product Link'] || item['ProductLink'] || item['OriginUrl'] || item['URL'] || item['Product URL'] || item['url'];
        const image = item['Product Image'] || item['ImageUrl'] || item['Image'] || item['Primary Image'] || item['image'];

        if (!url || url === '#') {
          console.warn(`   ! Skipping product without valid URL: ${name}`);
          continue;
        }

        const baseData = {
          productName: name,
          brand: item.Brand || item.brand || retailerName, 
          category: item.Category || 'Electronics',
          priceInr: price,
          productUrl: url,
          imageUrl: image,
          availabilityStatus: 'in_stock'
        };

        console.log(`   + Upserting: ${name} (Price: ${price})`);
        await upsertProduct(tableName, retailerName, baseData);
      }
    }

    // 2. Details Scraper pass
    const res = await db.query(`SELECT * FROM ${tableName} WHERE product_url IS NOT NULL`);
    const products = res.rows;
    console.log(`\n2. Running Details Scraper for ${products.length} products...`);

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`[${i+1}/${products.length}] Fetching details for: ${p.product_name}`);
      
      const detailData = await runDetailScraper(detailClient, p.product_url);
      if (detailData) {
        // Extract features from detail robot data
        const detailsText = detailData['Details'] || detailData['Description'] || '';
        let featuresList = [];
        if (detailsText) {
          const featuresMatch = detailsText.match(/Features:?\s*([\s\S]*?)(?=\n\n|Warranty:|General Specifications|Brand customer|$)/i);
          if (featuresMatch) {
            const featureLines = featuresMatch[1].split('\n').map(l => l.replace(/^[\s\-•*]+/, '').trim()).filter(l => l.length > 0);
            featuresList = featureLines;
          } else {
            const lines = detailsText.split('\n').map(l => l.replace(/^[\s\-•*]+/, '').trim()).filter(l => l.length > 0 && !l.startsWith('PRODUCT DETAILS'));
            featuresList = lines.slice(0, 10);
          }
        }
        // Add key specs from detail data as features
        const specKeys = ['Connectivity', 'Type', 'Microphone', 'Driver', 'Impedance', 'Driver Configuration', 'Connector', 'Plug'];
        for (const key of specKeys) {
          if (detailData[key]) featuresList.push(`${key}: ${detailData[key]}`);
        }

        let existingSpecs = {};
        if (p.specifications) {
          existingSpecs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
        }
        const mergedSpecs = { ...existingSpecs, ...detailData };

        const updateData = {
          productName: p.product_name,
          brand: detailData['Brand'] || detailData['brand'] || p.brand,
          productId: detailData['SKU'] || detailData['Model'] || p.product_id,
          category: detailData['Category'] || detailData['Type'] || p.category,
          priceInr: p.price_inr,
          rating: detailData['Rating'] || p.rating,
          reviewsCount: detailData['Reviews'] || p.reviews_count,
          description: detailsText || p.description,
          features: featuresList.length > 0 ? featuresList : p.features,
          specifications: mergedSpecs,
          imageUrl: detailData['Image'] || detailData['ImageUrl'] || detailData['Primary Image'] || p.image_url,
          productUrl: p.product_url,
          availabilityStatus: 'in_stock'
        };

        await upsertProduct(tableName, retailerName, updateData);
        console.log(`   ✓ Updated DB with detail features`);
      }
    }

    console.log(`\nCompleted Ingestion for ${retailerName}.`);

  } catch (error) {
    console.error('Fatal Error:', error.message);
  }
}

// CLI Support
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('Usage: node ingest-generic-retailer.js "Retailer Name" "ListRobotId" "DetailRobotId"');
        process.exit(1);
    }
    const [name, listId, detailId] = args;
    ingestGenericRetailer(name, listId, detailId).finally(() => db.pool.end());
}

module.exports = ingestGenericRetailer;
