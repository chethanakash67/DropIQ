require('dotenv').config();
const axios = require('axios');
const ProductRepository = require('../repositories/product-repository');

const APIFY_TOKEN = process.env.MYNTRA_APIFY_TOKEN || process.env.APIFY_API_TOKEN;
const MYNTRA_ACTOR_ID = process.env.MYNTRA_ACTOR_ID;

/**
 * Fetch Myntra products from Apify
 */
async function fetchMyntraProducts() {
  console.log('Fetching Myntra products from Apify...');
  console.log('Actor ID:', MYNTRA_ACTOR_ID);

  // Step 1: Get last successful run
  const runsRes = await axios.get('https://api.apify.com/v2/actor-runs', {
    params: {
      token: APIFY_TOKEN,
      actorId: MYNTRA_ACTOR_ID,
      status: 'SUCCEEDED',
      limit: 10,
      desc: true
    },
    timeout: 30000
  });

  const runs = runsRes.data?.data?.items || [];
  const actorRuns = runs.filter(r => r.actId === MYNTRA_ACTOR_ID);

  if (actorRuns.length === 0) {
    throw new Error('No successful runs found for Myntra actor');
  }

  const lastRun = actorRuns[0];
  console.log('Last successful run:', lastRun.id);
  console.log('Dataset ID:', lastRun.defaultDatasetId);

  // Step 2: Fetch all items from dataset
  const items = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const dsRes = await axios.get(`https://api.apify.com/v2/datasets/${lastRun.defaultDatasetId}/items`, {
      params: {
        token: APIFY_TOKEN,
        format: 'json',
        limit,
        offset
      },
      timeout: 120000
    });

    const batch = dsRes.data || [];
    if (batch.length === 0) {
      hasMore = false;
    } else {
      items.push(...batch);
      offset += batch.length;
      console.log(`Fetched ${items.length} items so far...`);
      if (batch.length < limit) hasMore = false;
    }
  }

  console.log(`Total Myntra products fetched: ${items.length}`);
  return items;
}

/**
 * Normalize Myntra product data
 */
function normalizeMyntraProduct(item) {
  // Get first image
  const defaultImage = item.images?.find(img => img.view === 'default') || item.images?.[0];
  const imageUrl = defaultImage?.src || null;

  // Get features from additional_info and product name
  const features = [];
  if (item.additional_info) {
    features.push(item.additional_info);
  }
  // Extract features from product name
  const name = item.name || '';
  if (name.includes('Bluetooth')) features.push('Bluetooth Connectivity');
  if (name.includes('ENC')) features.push('Environmental Noise Cancellation');
  if (name.includes('Mic')) features.push('Built-in Microphone');
  if (name.includes('Gaming')) features.push('Gaming Mode');
  if (name.includes('Playtime') || name.includes('Hours')) {
    const match = name.match(/(\d+)\s*H/i);
    if (match) features.push(`${match[1]} Hours Playtime`);
  }

  // Determine category
  const category = item.category?.toLowerCase() || '';
  const subCategory = item.sub_category?.toLowerCase() || '';
  let detectedCategory = 'headphones';
  if (category.includes('earbud') || name.toLowerCase().includes('earbud')) {
    detectedCategory = 'earbuds';
  } else if (name.toLowerCase().includes('neckband')) {
    detectedCategory = 'neckbands';
  } else if (name.toLowerCase().includes('wired') || name.toLowerCase().includes('earphone')) {
    detectedCategory = 'wired_earphones';
  }

  return {
    productName: item.name,
    brand: item.brand,
    productId: String(item.id),
    category: detectedCategory,
    priceInr: item.price || 0,
    rating: item.rating_score || null,
    reviewsCount: item.rating_count || null,
    description: item.additional_info || '',
    features: features.length > 0 ? features : null,
    specifications: {
      colour: item.primary_colour,
      sizes: item.sizes,
      gender: item.gender,
      masterCategory: item.master_category,
      subCategory: item.sub_category,
      discount: item.discount,
      discountLabel: item.discount_display_label
    },
    imageUrl: imageUrl,
    productUrl: `https://www.myntra.com/${item.id}`,
    availabilityStatus: 'in_stock',
    colours: item.colours || []
  };
}

/**
 * Main ingestion function
 */
async function ingestMyntraApify() {
  console.log('========================================');
  console.log('Myntra Apify Ingestion Started');
  console.log('========================================\n');

  if (!APIFY_TOKEN) {
    throw new Error('APIFY_API_TOKEN or MYNTRA_APIFY_TOKEN is required');
  }
  if (!MYNTRA_ACTOR_ID) {
    throw new Error('MYNTRA_ACTOR_ID is required in .env');
  }

  try {
    // Fetch products
    const rawProducts = await fetchMyntraProducts();
    console.log(`\nProcessing ${rawProducts.length} products...\n`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const rawProduct of rawProducts) {
      try {
        const normalized = normalizeMyntraProduct(rawProduct);

        if (!normalized.productName || normalized.priceInr === 0) {
          console.log(`⚠ Skipping invalid product: ${normalized.productName || 'unnamed'}`);
          continue;
        }

        const result = await ProductRepository.upsertMyntraProduct(normalized);

        if (result.inserted) {
          inserted++;
          console.log(`✓ Inserted: ${normalized.productName.substring(0, 60)}`);
        } else {
          updated++;
          console.log(`↻ Updated: ${normalized.productName.substring(0, 60)}`);
        }
      } catch (err) {
        errors++;
        console.error(`✗ Error processing product:`, err.message);
      }
    }

    console.log('\n========================================');
    console.log('Myntra Apify Ingestion Complete');
    console.log('========================================');
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    console.log('========================================\n');

    return { inserted, updated, errors };
  } catch (err) {
    console.error('Myntra Apify ingestion failed:', err.message);
    throw err;
  }
}

// Run if called directly
if (require.main === module) {
  ingestMyntraApify()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = ingestMyntraApify;
