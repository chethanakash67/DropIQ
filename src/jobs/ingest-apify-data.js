require('dotenv').config();
const ApifyClient = require('../services/apify-client');
const ProductRepository = require('../repositories/product-repository');

/**
 * Data Ingestion Job
 * 
 * Purpose: Fetch latest scraped product data from Apify and store in PostgreSQL
 * Schedule: Runs on 28th of each month (scraping happens on 27th)
 * Logic: UPSERT - updates existing products, inserts new ones
 */

// Helper: Normalize Amazon product data
function normalizeAmazonProduct(item) {
  // Extract price - handle both object and direct value
  let price = 0;
  if (typeof item.price === 'object' && item.price !== null) {
    price = item.price.value || 0;
  } else {
    price = item.price || item.discountedPrice || 0;
  }

  // Extract image URL - Amazon uses thumbnailImage or highResolutionImages
  let imageUrl = null;
  if (item.thumbnailImage) {
    imageUrl = item.thumbnailImage;
  } else if (Array.isArray(item.highResolutionImages) && item.highResolutionImages.length > 0) {
    imageUrl = item.highResolutionImages[0];
  } else if (Array.isArray(item.galleryThumbnails) && item.galleryThumbnails.length > 0) {
    imageUrl = item.galleryThumbnails[0];
  } else if (Array.isArray(item.images) && item.images.length > 0) {
    imageUrl = item.images[0];
  } else if (item.thumbnail) {
    imageUrl = item.thumbnail;
  } else if (item.image) {
    imageUrl = item.image;
  } else if (item.imageUrl) {
    imageUrl = item.imageUrl;
  }

  return {
    title: item.title || item.name,
    brand: item.brand || null,
    asin: item.asin,
    price: price,
    rating: item.stars || item.rating || null,
    reviewsCount: item.reviewsCount || item.reviews_count || null,
    description: item.description || '',
    features: item.features || [],
    reviews: item.reviews || [],
    specifications: item.specifications || null,
    imageUrl: imageUrl,
    url: item.url || item.productUrl || null,
    availability: item.availability || 'in_stock',
  };
}

// Helper: Normalize Flipkart product data
function normalizeFlipkartProduct(item) {
  const product = item.productData;
  if (!product) return null;

  const pricing = product.pricing || {};

  // Get the base URL - it can be at root level or in productData
  let baseUrl = item.baseUrl || product.baseUrl;
  let fullUrl = null;
  if (baseUrl) {
    fullUrl = baseUrl.startsWith('http') ? baseUrl : `https://www.flipkart.com${baseUrl}`;
  }

  // Get title from titles object
  const title = product.titles?.title || product.titles?.newTitle || product.title;

  // Get brand from titles or productBrand
  const brand = product.titles?.superTitle || product.productBrand || null;

  // Extract rating and reviews count
  let rating = null;
  let reviewsCount = null;

  if (product.rating) {
    rating = product.rating.average || product.rating.value || product.rating.overall || null;
    reviewsCount = product.rating.count || product.rating.reviewCount || product.rating.totalReviews || null;
  }

  // Try alternate locations for review count
  if (!reviewsCount && product.ratingsAndReviews) {
    reviewsCount = product.ratingsAndReviews.reviewCount || product.ratingsAndReviews.count || null;
  }

  if (!reviewsCount && product.reviews) {
    reviewsCount = product.reviews.count || product.reviews.length || null;
  }

  // Get image URL - clean up the template placeholders
  let imageUrl = product.media?.images?.[0]?.url || null;
  if (imageUrl) {
    // Replace Flipkart's template placeholders with actual values
    imageUrl = imageUrl.replace('{@width}', '400').replace('{@height}', '400').replace('{@quality}', '70');
  }

  return {
    title: title,
    brand: brand,
    productId: product.id || item.id,
    price: pricing.finalPrice?.value || pricing.mrp?.value || 0,
    rating: rating,
    reviewsCount: reviewsCount,
    description: (product.keySpecs || []).join(' | '),
    keySpecs: product.keySpecs || [],
    reviews: [],
    specifications: product.specifications || null,
    imageUrl: imageUrl,
    url: fullUrl,
    availability: product.availability?.displayState === 'IN_STOCK' ? 'in_stock' : 'out_of_stock',
  };
}

// Helper: Determine category from product data
function determineCategory(product) {
  const title = (product.title || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const combined = title + ' ' + description;

  if (combined.includes('robot') && combined.includes('vacuum')) return 'robot_vacuums';
  if (combined.includes('earbud') || combined.includes('truly wireless') || combined.includes('tws')) return 'earbuds';
  if (combined.includes('neckband')) return 'neckbands';
  if (combined.includes('wired') && combined.includes('earphone')) return 'wired_earphones';
  if (combined.includes('headphone')) return 'headphones';

  // Default based on wireless/bluetooth keywords
  if (combined.includes('wireless') || combined.includes('bluetooth')) return 'earbuds';
  return 'headphones';
}

async function ingestApifyData() {
  console.log('========================================');
  console.log('Starting Apify Data Ingestion Job');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('========================================\n');

  const startTime = Date.now();
  let amazonInserted = 0;
  let amazonUpdated = 0;
  let flipkartInserted = 0;
  let flipkartUpdated = 0;
  let errorCount = 0;

  try {
    // Step 1: Fetch data from all Apify sources
    const apifyClient = new ApifyClient();
    const scrapedProducts = await apifyClient.fetchAllProducts();

    if (!scrapedProducts || scrapedProducts.length === 0) {
      console.log('\n⚠ No products fetched from any Apify source');
      return;
    }

    console.log(`\n========================================`);
    console.log('Processing products...');
    console.log('========================================\n');

    // Step 2: Process each product
    for (const scrapedProduct of scrapedProducts) {
      try {
        const retailer = scrapedProduct._sourceRetailer;

        if (retailer === 'Amazon') {
          // Process Amazon product
          const normalized = normalizeAmazonProduct(scrapedProduct);

          if (!normalized.title || parseFloat(normalized.price) === 0) {
            continue;
          }

          const category = determineCategory(normalized);

          const productData = {
            productName: normalized.title,
            brand: normalized.brand,
            asin: normalized.asin,
            category,
            priceInr: parseFloat(normalized.price),
            rating: normalized.rating ? parseFloat(normalized.rating) : null,
            reviewsCount: normalized.reviewsCount,
            description: normalized.description,
            features: normalized.features.length > 0 ? JSON.stringify(normalized.features) : null,
            reviews: normalized.reviews.length > 0 ? JSON.stringify(normalized.reviews.slice(0, 5)) : null,
            specifications: normalized.specifications ? JSON.stringify(normalized.specifications) : null,
            imageUrl: normalized.imageUrl,
            productUrl: normalized.url,
            availabilityStatus: normalized.availability === 'out_of_stock' ? 'out_of_stock' : 'in_stock',
          };

          const result = await ProductRepository.upsertAmazonProduct(productData);

          if (result.inserted) {
            amazonInserted++;
            console.log(`✓ [Amazon] Inserted: ${productData.productName}`);
          } else {
            amazonUpdated++;
            console.log(`↻ [Amazon] Updated: ${productData.productName}`);
          }

        } else if (retailer === 'Flipkart') {
          // Process Flipkart product
          const normalized = normalizeFlipkartProduct(scrapedProduct);

          if (!normalized || !normalized.title || parseFloat(normalized.price) === 0) {
            continue;
          }

          const category = determineCategory(normalized);

          const productData = {
            productName: normalized.title,
            brand: normalized.brand,
            productId: normalized.productId,
            category,
            priceInr: parseFloat(normalized.price),
            rating: normalized.rating ? parseFloat(normalized.rating) : null,
            reviewsCount: normalized.reviewsCount,
            description: normalized.description,
            keySpecs: normalized.keySpecs.length > 0 ? JSON.stringify(normalized.keySpecs) : null,
            reviews: normalized.reviews.length > 0 ? JSON.stringify(normalized.reviews.slice(0, 5)) : null,
            specifications: normalized.specifications ? JSON.stringify(normalized.specifications) : null,
            imageUrl: normalized.imageUrl,
            productUrl: normalized.url,
            availabilityStatus: normalized.availability === 'out_of_stock' ? 'out_of_stock' : 'in_stock',
          };

          const result = await ProductRepository.upsertFlipkartProduct(productData);

          if (result.inserted) {
            flipkartInserted++;
            console.log(`✓ [Flipkart] Inserted: ${productData.productName}`);
          } else {
            flipkartUpdated++;
            console.log(`↻ [Flipkart] Updated: ${productData.productName}`);
          }
        }

      } catch (error) {
        errorCount++;
        console.error(`✗ Error processing product:`, error.message);
      }
    }

    // Step 3: Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n========================================');
    console.log('Ingestion Job Complete');
    console.log('========================================');
    console.log(`Amazon Products:`);
    console.log(`  - Inserted: ${amazonInserted}`);
    console.log(`  - Updated: ${amazonUpdated}`);
    console.log(`Flipkart Products:`);
    console.log(`  - Inserted: ${flipkartInserted}`);
    console.log(`  - Updated: ${flipkartUpdated}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Duration: ${duration}s`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Ingestion job failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run ingestion if called directly
if (require.main === module) {
  ingestApifyData()
    .then(() => {
      console.log('Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = ingestApifyData;
