require('dotenv').config();
const axios = require('axios');
const db = require('../database/db');
const sovrnAffiliate = require('../utils/sovrn-affiliate');

const BASE_URL = process.env.BROWSEAI_API_BASE_URL || 'https://api.browse.ai/v2';
const DETAIL_CONCURRENCY = Number.parseInt(process.env.BROWSEAI_DETAIL_CONCURRENCY || '3', 10) || 3;

const STORES = [
  {
    key: 'ONEPLUS',
    retailerName: 'OnePlus',
    tableName: 'oneplus_products',
    brand: 'OnePlus',
    baseUrl: 'https://www.oneplus.in',
  },
  {
    key: 'RELIANCE_DIGITAL',
    retailerName: 'Reliance Digital',
    tableName: 'reliance_digital_products',
    brand: 'Reliance Digital',
    baseUrl: 'https://www.reliancedigital.in',
  },
  {
    key: 'BOAT',
    retailerName: 'boAt',
    tableName: 'boat_products',
    brand: 'boAt',
    baseUrl: 'https://www.boat-lifestyle.com',
  },
  {
    key: 'ZEBRONICS',
    retailerName: 'Zebronics',
    tableName: 'zebronics_products',
    brand: 'Zebronics',
    baseUrl: 'https://zebronics.com',
  },
];

function browseAiApiKey(store) {
  if (!store) return process.env.BROWSEAI_API_KEY;
  return process.env[`BROWSEAI_${store.key}_API_KEY`]
    || process.env[`BROWSEAI_${store.key}_MAIN_API`]
    || process.env.BROWSEAI_API_KEY;
}

function browseAiHeaders(store) {
  const apiKey = browseAiApiKey(store);
  if (!apiKey) {
    throw new Error(`Browse.ai API key is required for ${store?.retailerName || 'store'} in .env`);
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

function assertSafeTableName(tableName) {
  if (!/^[a-z0-9_]+$/.test(tableName)) {
    throw new Error(`Unsafe table name: ${tableName}`);
  }
}

async function ensureStoreTable(tableName) {
  assertSafeTableName(tableName);

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
      recommendations JSONB,
      price_comparisons JSONB,
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

  await db.query(`CREATE INDEX IF NOT EXISTS idx_${tableName}_product_name ON ${tableName}(product_name)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_${tableName}_category ON ${tableName}(category)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_${tableName}_price ON ${tableName}(price_inr)`);
}

async function fetchTaskData(store, robotId, taskId) {
  const url = `${BASE_URL}/robots/${robotId}/tasks/${taskId}`;
  const response = await axios.get(url, {
    headers: browseAiHeaders(store),
    timeout: 30000,
  });

  const result = response.data?.result;
  if (!result) {
    throw new Error('Browse.ai task response did not include result data');
  }

  return {
    status: result.status,
    capturedLists: result.capturedLists || {},
    capturedTexts: result.capturedTexts || {},
  };
}

async function fetchTaskDataWithFallback(store, robotId, taskId) {
  try {
    return await fetchTaskData(store, robotId, taskId);
  } catch (error) {
    throw error;
  }
}

async function fetchBulkRunData(store, robotId, bulkRunId) {
  const url = `${BASE_URL}/robots/${robotId}/bulk-runs/${bulkRunId}`;
  const response = await axios.get(url, {
    headers: browseAiHeaders(store),
    timeout: 30000,
  });

  return response.data?.result || response.data || {};
}

async function runRobot(store, robotId, inputParameters) {
  const response = await axios.post(`${BASE_URL}/robots/${robotId}/tasks`, {
    inputParameters,
  }, {
    headers: browseAiHeaders(store),
    timeout: 30000,
  });

  return response.data?.result;
}

async function pollTask(store, robotId, taskId, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const data = await fetchTaskData(store, robotId, taskId);
    if (data.status === 'successful' || data.status === 'failed') {
      return data;
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error(`Browse.ai task ${taskId} did not finish in time`);
}

function allListItems(capturedLists) {
  return Object.values(capturedLists)
    .filter(Array.isArray)
    .flat();
}

async function mapWithConcurrency(items, concurrency, handler) {
  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  let nextIndex = 0;

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex++;
      await handler(items[currentIndex], currentIndex);
    }
  }));
}

function collectBulkTaskItems(value, output = []) {
  if (!value || typeof value !== 'object') return output;

  if (Array.isArray(value)) {
    for (const item of value) collectBulkTaskItems(item, output);
    return output;
  }

  if (
    value.capturedTexts ||
    value.capturedLists ||
    value.inputParameters ||
    value.result?.capturedTexts ||
    value.result?.capturedLists
  ) {
    output.push(value);
  }

  for (const nested of Object.values(value)) {
    if (nested && typeof nested === 'object') {
      collectBulkTaskItems(nested, output);
    }
  }

  return output;
}

function fieldValue(item, names) {
  const entries = Object.entries(item || {});
  for (const name of names) {
    const exact = entries.find(([key]) => key.toLowerCase() === name.toLowerCase());
    if (exact && exact[1] !== undefined && exact[1] !== null && String(exact[1]).trim() !== '') {
      return exact[1];
    }
  }

  for (const name of names) {
    const partial = entries.find(([key]) => key.toLowerCase().includes(name.toLowerCase()));
    if (partial && partial[1] !== undefined && partial[1] !== null && String(partial[1]).trim() !== '') {
      return partial[1];
    }
  }

  return null;
}

function parseNumber(value) {
  if (value === undefined || value === null) return null;
  const match = String(value).match(/[\d,]+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0].replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function absoluteUrl(value, baseUrl) {
  if (!value) return null;
  const url = String(value).trim();
  if (!url || url === '#') return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return url;
}

function normalizeUrlKey(url) {
  if (!url) return null;
  return String(url).trim().replace(/\/+$/, '').toLowerCase();
}

function detailDataFromBulkTask(task) {
  const result = task.result || task;
  const capturedTexts = result.capturedTexts || task.capturedTexts || {};
  const capturedLists = result.capturedLists || task.capturedLists || {};
  const detailData = { ...capturedTexts };

  for (const [listName, listItems] of Object.entries(capturedLists)) {
    if (Array.isArray(listItems)) {
      detailData[listName] = listItems;
    }
  }

  return detailData;
}

function inputParametersFromBulkTask(task) {
  const result = task.result || task;
  return result.inputParameters || task.inputParameters || {};
}

function buildDetailMapFromBulkRun(bulkRunData, store) {
  const detailMap = new Map();
  const tasks = collectBulkTaskItems(bulkRunData);

  for (const task of tasks) {
    const inputParameters = inputParametersFromBulkTask(task);
    const detailData = detailDataFromBulkTask(task);
    const url = absoluteUrl(fieldValue(inputParameters, [
      'OriginUrl',
      'originUrl',
      'URL',
      'Product URL',
      'Product Link',
    ]), store.baseUrl);

    const key = normalizeUrlKey(url);
    if (key) {
      detailMap.set(key, detailData);
    }
  }

  return detailMap;
}

function determineCategory(productName, description = '') {
  const name = String(productName || '').toLowerCase();
  const text = `${productName} ${description}`.toLowerCase();
  if (text.includes('robot') && text.includes('vacuum')) return 'robot_vacuums';
  if (
    name.includes('wired') ||
    text.includes('wired earphone') ||
    text.includes('wired earbud') ||
    text.includes('3.5 mm jack')
  ) return 'wired_earphones';
  if (
    text.includes('neckband') ||
    text.includes('neck band') ||
    text.includes('yoga') ||
    text.includes('raga') ||
    text.includes('chime') ||
    text.includes('evolve') ||
    text.includes('jumbo')
  ) return 'neckbands';
  if (
    text.includes('earbud') ||
    text.includes('ear bud') ||
    text.includes('buds') ||
    text.includes('pods') ||
    text.includes('tws') ||
    text.includes('sound bomb')
  ) return 'earbuds';
  if (
    text.includes('headphone') ||
    text.includes('headset') ||
    text.includes('escape') ||
    text.includes('storm') ||
    text.includes('monk') ||
    text.includes('glacier') ||
    text.includes('meteoroid') ||
    text.includes('mist') ||
    text.includes('jiggle')
  ) return 'headphones';
  if (text.includes('phone') || text.includes('mobile')) return 'smartphones';
  return 'electronics';
}

function normalizeProduct(item, store, detailData = {}) {
  const productName = fieldValue(item, [
    'Product Name',
    'ProductName',
    'Product Title',
    'Title',
    'Name',
    'product_name',
  ]);

  if (!productName) return null;

  const productUrl = absoluteUrl(fieldValue(item, [
    'Product Link',
    'Product URL',
    'ProductLink',
    'URL',
    'Link',
    'href',
    'OriginUrl',
  ]), store.baseUrl);

  const imageUrl = absoluteUrl(fieldValue(item, [
    'Product Image',
    'Image URL',
    'ImageUrl',
    'Primary Image',
    'Image',
    'image',
  ]), store.baseUrl);

  const description = fieldValue(detailData, ['Description', 'Details', 'Product Details'])
    || fieldValue(item, ['Description', 'Details', 'Subtitle'])
    || null;

  const priceInr = parseNumber(fieldValue(item, [
    'Discounted Price',
    'Current Price',
    'Product Price',
    'Selling Price',
    'Sale Price',
    'Price',
    'MRP',
  ]));

  const rating = parseNumber(fieldValue(item, ['Rating', 'Product Rating', 'Product Ratings']));
  const reviewsCount = parseNumber(fieldValue(item, ['Reviews', 'Review Count', 'Number of Reviews', 'Number of Ratings']));

  const features = [];
  for (const [key, value] of Object.entries(detailData)) {
    if (/feature|highlight|spec|detail/i.test(key) && value) {
      features.push(`${key}: ${value}`);
    }
  }

  const categoryText = [
    description,
    fieldValue(item, ['Features', 'Image Alt Text', 'Subtitle']),
    JSON.stringify(detailData),
  ].filter(Boolean).join(' ');

  return {
    productName: String(productName).trim(),
    brand: fieldValue(item, ['Brand', 'brand']) || store.brand,
    productId: fieldValue(item, ['SKU', 'Model', 'Product ID', 'ProductId', 'ID', 'Position']) || null,
    category: determineCategory(productName, categoryText),
    priceInr,
    rating,
    reviewsCount,
    description,
    features: features.length > 0 ? features : null,
    specifications: {
      sourceListItem: item,
      detailData,
    },
    imageUrl,
    productUrl,
    availabilityStatus: /out of stock|sold out|notify me/i.test(JSON.stringify(item)) ? 'out_of_stock' : 'in_stock',
  };
}

async function fetchDetailForProduct(store, productUrl) {
  const detailRobotId = process.env[`BROWSEAI_${store.key}_DETAIL_ROBOT_ID`];
  if (!detailRobotId || !productUrl) return {};

  try {
    const task = await runRobot(store, detailRobotId, {
      originUrl: productUrl,
      OriginUrl: productUrl,
    });

    if (!task?.id) return {};
    const detailTask = await pollTask(store, detailRobotId, task.id, 24);
    return detailTask.capturedTexts || {};
  } catch (error) {
    console.warn(`Detail scrape failed for ${productUrl}: ${error.response?.data?.message || error.message}`);
    return {};
  }
}

async function upsertStoreProduct(tableName, store, product) {
  assertSafeTableName(tableName);

  const affiliateUrl = product.productUrl
    ? sovrnAffiliate.generateAffiliateLink(product.productUrl, {
      cuid: `${tableName.replace(/_products$/, '')}_${product.productId || product.productName}`,
      utm_campaign: tableName.replace(/_products$/, ''),
    })
    : null;

  const query = `
    INSERT INTO ${tableName} (
      product_name, brand, product_id, category, price_inr, rating, reviews_count,
      description, features, specifications, image_url, product_url, affiliate_url,
      availability_status, last_updated
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
    ON CONFLICT (product_name) DO UPDATE SET
      brand = EXCLUDED.brand,
      product_id = EXCLUDED.product_id,
      category = EXCLUDED.category,
      price_inr = EXCLUDED.price_inr,
      rating = EXCLUDED.rating,
      reviews_count = EXCLUDED.reviews_count,
      description = EXCLUDED.description,
      features = EXCLUDED.features,
      specifications = EXCLUDED.specifications,
      image_url = EXCLUDED.image_url,
      product_url = EXCLUDED.product_url,
      affiliate_url = EXCLUDED.affiliate_url,
      availability_status = EXCLUDED.availability_status,
      last_updated = NOW()
    RETURNING id, (xmax = 0) AS inserted
  `;

  const values = [
    product.productName,
    product.brand || store.brand,
    product.productId,
    product.category,
    product.priceInr,
    product.rating,
    product.reviewsCount,
    product.description,
    product.features ? JSON.stringify(product.features) : null,
    product.specifications ? JSON.stringify(product.specifications) : null,
    product.imageUrl,
    product.productUrl,
    affiliateUrl,
    product.availabilityStatus,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
}

async function ingestStore(store) {
  const robotId = process.env[`BROWSEAI_${store.key}_ROBOT_ID`];
  const taskId = process.env[`BROWSEAI_${store.key}_TASK_ID`];
  const detailRobotId = process.env[`BROWSEAI_${store.key}_DETAIL_ROBOT_ID`];
  const detailBulkRunId = process.env[`BROWSEAI_${store.key}_DETAIL_BULK_RUN_ID`];

  if (!robotId || !taskId) {
    console.log(`Skipping ${store.retailerName}: missing robot/task env config`);
    return { total: 0, inserted: 0, updated: 0, errors: 0, skipped: true };
  }

  console.log(`\n========================================`);
  console.log(`Browse.ai ingestion: ${store.retailerName}`);
  console.log(`Robot ID: ${robotId}`);
  console.log(`Task ID: ${taskId}`);
  console.log(`Table: ${store.tableName}`);
  console.log(`========================================\n`);

  await ensureStoreTable(store.tableName);

  const taskData = await fetchTaskDataWithFallback(store, robotId, taskId);
  if (taskData.status !== 'successful') {
    throw new Error(`${store.retailerName} task is ${taskData.status}; expected successful`);
  }

  const items = allListItems(taskData.capturedLists);
  console.log(`Found ${items.length} list products`);

  let detailMap = new Map();
  if (detailRobotId && detailBulkRunId) {
    try {
      const bulkRunData = await fetchBulkRunData(store, detailRobotId, detailBulkRunId);
      detailMap = buildDetailMapFromBulkRun(bulkRunData, store);
      console.log(`Loaded ${detailMap.size} detail records from bulk run`);
    } catch (error) {
      console.warn(`Detail bulk run could not be loaded: ${error.response?.data?.message || error.message}`);
    }
  }

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  await mapWithConcurrency(items, DETAIL_CONCURRENCY, async (item, index) => {
    try {
      const baseUrl = absoluteUrl(fieldValue(item, ['Product Link', 'Product URL', 'URL', 'Link', 'href']), store.baseUrl);
      const bulkDetailData = detailMap.get(normalizeUrlKey(baseUrl));
      const detailData = bulkDetailData || await fetchDetailForProduct(store, baseUrl);
      const product = normalizeProduct(item, store, detailData);

      if (!product || !product.productName) {
        return;
      }

      const result = await upsertStoreProduct(store.tableName, store, product);
      if (result.inserted) inserted++;
      else updated++;

      console.log(`${result.inserted ? '✓ Inserted' : '↻ Updated'} ${store.retailerName}: ${product.productName}`);
    } catch (error) {
      errors++;
      console.error(`✗ Error processing ${store.retailerName} item ${index + 1}:`, error.message);
    }
  });

  return { total: items.length, inserted, updated, errors };
}

async function ingestBrowseAiStores(targetKeys = []) {
  const targetSet = new Set(targetKeys.map(key => key.toUpperCase().replace(/[-\s]/g, '_')));
  const stores = targetSet.size > 0 ? STORES.filter(store => targetSet.has(store.key)) : STORES;
  const summary = {};

  for (const store of stores) {
    try {
      summary[store.key] = await ingestStore(store);
    } catch (error) {
      summary[store.key] = { total: 0, inserted: 0, updated: 0, errors: 1, error: error.response?.data?.message || error.message };
      console.error(`✗ ${store.retailerName} ingestion failed:`, summary[store.key].error);
    }
  }

  console.log('\n========================================');
  console.log('Browse.ai store ingestion summary');
  console.log('========================================');
  console.log(JSON.stringify(summary, null, 2));
  console.log('========================================\n');

  return summary;
}

if (require.main === module) {
  ingestBrowseAiStores(process.argv.slice(2))
    .then(() => db.pool.end())
    .catch(async error => {
      console.error('Fatal Browse.ai store ingestion error:', error);
      await db.pool.end();
      process.exit(1);
    });
}

module.exports = ingestBrowseAiStores;
