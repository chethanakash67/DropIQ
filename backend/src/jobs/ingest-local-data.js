require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ProductRepository = require('../repositories/product-repository');

/**
 * Local Test Ingestion - Uses JSON files in workspace instead of Apify API
 * Use this for testing without hitting Apify API
 */

function normalizeFlipkartProduct(item) {
  const product = item.productData;
  const pricing = product.pricing || {};

  return {
    title: product.title,
    name: product.title,
    price: pricing.finalPrice?.value || pricing.mrp?.value || 0,
    discountedPrice: pricing.finalPrice?.value || 0,
    rating: product.rating?.value || null,
    description: (product.keySpecs || []).join(' | '),
    features: product.keySpecs || [],
    reviews: [], // Reviews not in this dataset
    imageUrl: product.media?.images?.[0]?.url || null,
    url: `https://www.flipkart.com${product.baseUrl}`,
    productUrl: `https://www.flipkart.com${product.baseUrl}`,
    store: 'Flipkart',
    availability: product.availability?.displayState === 'IN_STOCK' ? 'in_stock' : 'out_of_stock',
  };
}

function normalizeAmazonProduct(item) {
  return {
    title: item.title || item.name,
    name: item.title || item.name,
    price: item.price || item.discountedPrice || 0,
    discountedPrice: item.discountedPrice || item.price || 0,
    rating: item.stars || item.rating || null,
    description: item.description || '',
    features: item.features || [],
    reviews: item.reviews || [],
    imageUrl: item.thumbnail || item.image || null,
    url: item.url || item.productUrl || '',
    productUrl: item.url || item.productUrl || '',
    store: 'Amazon',
    availability: item.availability || 'in_stock',
  };
}

function determineCategory(product) {
  const title = (product.title || product.name || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const combined = title + ' ' + description;

  if (combined.includes('robot') && combined.includes('vacuum')) return 'robot_vacuums';
  if (combined.includes('earbud') || combined.includes('truly wireless') || combined.includes('tws')) return 'earbuds';
  if (combined.includes('neckband')) return 'neckbands';
  if (combined.includes('wired') && combined.includes('earphone')) return 'wired_earphones';
  if (combined.includes('headphone')) return 'headphones';

  // Default based on keywords
  if (combined.includes('wireless') || combined.includes('bluetooth')) return 'earbuds';
  return 'headphones';
}

function buildSpecifications(product) {
  const specs = {};

  if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
    specs.reviews = product.reviews.slice(0, 3);
  }

  if (product.features && Array.isArray(product.features) && product.features.length > 0) {
    specs.features = product.features;
  }

  if (product.imageUrl) {
    specs.imageUrl = product.imageUrl;
  }

  if (product.emi) {
    specs.emi = product.emi;
  }

  return Object.keys(specs).length > 0 ? specs : null;
}

async function ingestLocalData() {
  console.log('========================================');
  console.log('Starting Local Test Ingestion');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('========================================\n');

  const startTime = Date.now();
  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  try {
    // Find all dataset JSON files
    const workspaceRoot = path.join(__dirname, '../..');
    const files = fs.readdirSync(workspaceRoot)
      .filter(f => f.startsWith('dataset_') && f.endsWith('.json'));

    console.log(`Found ${files.length} dataset files:\n${files.join('\n')}\n`);

    for (const file of files) {
      const filePath = path.join(workspaceRoot, file);
      console.log(`\nProcessing: ${file}`);

      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const isFlipkart = file.includes('flipkart');
      const isAmazon = file.includes('amazon');

      console.log(`  Detected source: ${isFlipkart ? 'Flipkart' : isAmazon ? 'Amazon' : 'Unknown'}`);
      console.log(`  Raw items: ${rawData.length}`);

      for (const item of rawData) {
        try {
          // Normalize based on source
          let normalized;
          if (isFlipkart) {
            normalized = normalizeFlipkartProduct(item);
          } else if (isAmazon) {
            normalized = normalizeAmazonProduct(item);
          } else {
            console.log('  ⚠ Unknown data format, skipping');
            continue;
          }

          // Skip if no title
          if (!normalized.title && !normalized.name) {
            continue;
          }

          // Get or create retailer
          const retailerId = await ProductRepository.getOrCreateRetailer(normalized.store);

          // Determine category
          const category = determineCategory(normalized);

          // Build product data
          const productData = {
            productName: normalized.title || normalized.name,
            category,
            retailerId,
            priceInr: parseFloat(normalized.discountedPrice || normalized.price || 0),
            rating: normalized.rating ? parseFloat(normalized.rating) : null,
            description: normalized.description || null,
            specifications: buildSpecifications(normalized),
            affiliateLink: normalized.url || normalized.productUrl || null,
            availabilityStatus: normalized.availability === 'out_of_stock' ? 'out_of_stock' : 'in_stock',
            stockQuantity: null,
          };

          // Skip if price is 0
          if (productData.priceInr === 0) {
            continue;
          }

          // UPSERT product
          const result = await ProductRepository.upsertProduct(productData);

          if (result.inserted) {
            insertedCount++;
          } else {
            updatedCount++;
          }

        } catch (error) {
          errorCount++;
          console.error(`  ✗ Error processing item:`, error.message);
        }
      }

      console.log(`  ✓ Completed: ${file}`);
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n========================================');
    console.log('Local Ingestion Complete');
    console.log('========================================');
    console.log(`Files Processed: ${files.length}`);
    console.log(`  - Inserted (new): ${insertedCount}`);
    console.log(`  - Updated (existing): ${updatedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    console.log(`Duration: ${duration}s`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Local ingestion failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run ingestion if called directly
if (require.main === module) {
  ingestLocalData()
    .then(() => {
      console.log('Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = ingestLocalData;
