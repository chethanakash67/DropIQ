require('dotenv').config();
const BrowseAiClient = require('../services/browseai-client');
const ProductRepository = require('../repositories/product-repository');

/**
 * Samsung Data Ingestion Job (via Browse.ai)
 * 
 * Purpose: Fetch Samsung store products and intelligently store them:
 * - If product exists in Amazon/Flipkart → Update that table
 * - If product doesn't exist anywhere → Insert into samsung_products
 */

// Helper: Determine category from product name/description
function determineCategory(productName, description = '') {
  const text = `${productName} ${description}`.toLowerCase();

  if (text.includes('robot') && text.includes('vacuum')) return 'robot_vacuums';
  if (text.includes('neckband')) return 'neckbands';
  if (text.includes('earbud') || text.includes('ear bud') || text.includes('buds')) return 'earbuds';
  if (text.includes('wired') && (text.includes('earphone') || text.includes('headphone'))) return 'wired_earphones';
  if (text.includes('headphone') || text.includes('headset')) return 'headphones';

  // Default to earbuds if unclear
  return 'earbuds';
}

// Helper: Get category code for product ID generation
function getCategoryCode(category) {
  const categoryMap = {
    'earbuds': '1',
    'headphones': '2',
    'neckbands': '3',
    'wired_earphones': '4',
    'robot_vacuums': '5'
  };
  return categoryMap[category] || '1';
}

// Helper: Generate Samsung product ID
let productCounter = {};
function generateSamsungProductId(category) {
  const categoryCode = getCategoryCode(category);

  // Initialize counter for this category if needed
  if (!productCounter[categoryCode]) {
    productCounter[categoryCode] = 1;
  }

  // Format: sam_<category>_<serial>
  const serial = String(productCounter[categoryCode]).padStart(2, '0');
  productCounter[categoryCode]++;

  return `sam_${categoryCode}_${serial}`;
}

// Helper: Parse Samsung products from captured text
function parseSamsungProducts(capturedText) {
  const products = [];

  // Split by product pattern - each product starts with "PICK\nQuick Look\n" or "Quick Look\n"
  // followed by product name
  const productBlocks = capturedText.split(/(?=(?:PICK\n)?Quick Look\n(?:Galaxy Buds|Samsung EHS|Stereo Headset))/g);

  for (const block of productBlocks) {
    if (block.trim().length < 20) continue; // Skip too short blocks

    const product = {};

    // Extract product name - more flexible pattern
    let nameMatch = block.match(/Quick Look\n(Galaxy Buds[^\n]+)/);
    if (!nameMatch) {
      nameMatch = block.match(/Quick Look\n(Samsung EHS[^\n]+)/);
    }
    if (!nameMatch) {
      nameMatch = block.match(/Quick Look\n(Stereo Headset[^\n]+)/);
    }

    if (nameMatch) {
      // Clean up the name - remove extra text like "Product Ratings"
      let name = nameMatch[1].split('Product Ratings')[0].trim();
      name = name.split('Colour')[0].trim();
      product.name = name;
    } else {
      continue; // Skip if no name found
    }

    // Extract rating
    const ratingMatch = block.match(/Product Ratings\s*:\s*([\d.]+)/);
    if (ratingMatch) {
      product.rating = parseFloat(ratingMatch[1]);
    }

    // Extract reviews count
    const reviewsMatch = block.match(/Number of Ratings\s*:\s*([\d,]+)/);
    if (reviewsMatch) {
      product.reviewsCount = parseInt(reviewsMatch[1].replace(/,/g, ''));
    }

    // Extract price (Total Price or MRP) - if not found, set to null
    const priceMatch = block.match(/Total Price:\s*₹([\d,]+\.?\d*)|MRP:\s*₹([\d,]+\.?\d*)/);
    if (priceMatch) {
      const priceStr = (priceMatch[1] || priceMatch[2]).replace(/,/g, '');
      product.price = parseFloat(priceStr);
    } else {
      // No price available - set to null (will be handled in DB as NULL)
      product.price = null;
      product.whereToBuyLink = true; // Mark that this product has "Where to buy" link
    }

    // Extract colors
    const colorMatch = block.match(/Colour\s*:\s*([^\n]+)/);
    if (colorMatch) {
      product.colors = colorMatch[1].split('\n')[0].trim();
    }

    // Set default values
    product.brand = 'Samsung';

    // Determine availability
    if (block.includes('Notify me')) {
      product.availability = 'out_of_stock';
    } else if (block.includes('Where to buy')) {
      // Available but price not shown - check offline stores
      product.availability = 'in_stock';
    } else if (block.includes('Add to cart')) {
      product.availability = 'in_stock';
    } else {
      product.availability = 'in_stock';
    }

    // Extract URLs
    // For Samsung products, we need to construct URLs based on product name
    // "Learn more" URL pattern: /in/audio-sound/<product-slug>/
    // "Where to buy" is a maps link (not in text, would need actual scraping)

    // Add if valid (has name only - price is optional now)
    if (product.name) {
      products.push(product);
    }
  }

  return products;
}

// Helper: Normalize Samsung product from parsed data
function normalizeSamsungProduct(parsedProduct) {
  const category = determineCategory(parsedProduct.name);
  const productId = generateSamsungProductId(category);

  // Generate product URL based on Samsung's pattern
  // Pattern: /in/audio-sound/<category>/<product-slug>/
  let urlCategory = 'others';
  if (parsedProduct.name.toLowerCase().includes('galaxy buds')) {
    urlCategory = 'galaxy-buds';
  } else if (parsedProduct.name.toLowerCase().includes('level')) {
    urlCategory = 'others';
  } else if (parsedProduct.name.toLowerCase().includes('ehs')) {
    urlCategory = 'others';
  }

  // Generate slug from product name
  const productSlug = parsedProduct.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const productUrl = `https://www.samsung.com/in/audio-sound/${urlCategory}/${productSlug}/`;

  return {
    productName: parsedProduct.name,
    brand: parsedProduct.brand || 'Samsung',
    productId: productId,
    category,
    priceInr: parsedProduct.price, // Will be NULL if not available
    rating: parsedProduct.rating || null,
    reviewsCount: parsedProduct.reviewsCount || null,
    description: parsedProduct.colors ? `Available in: ${parsedProduct.colors}` : null,
    features: parsedProduct.colors ? { colors: parsedProduct.colors } : null,
    specifications: null,
    imageUrl: null, // Not available in text data
    productUrl: productUrl,
    availabilityStatus: parsedProduct.availability || 'in_stock'
  };
}

async function ingestSamsungData() {
  console.log('\n========================================');
  console.log('Samsung Data Ingestion (Browse.ai)');
  console.log('========================================\n');

  const startTime = Date.now();
  const stats = {
    total: 0,
    updatedInAmazon: 0,
    updatedInFlipkart: 0,
    insertedInSamsung: 0,
    skipped: 0,
    errors: 0
  };

  try {
    // Initialize Browse.ai client
    const browseAiClient = new BrowseAiClient();

    // Fetch data from Browse.ai
    const rawData = await browseAiClient.fetchTaskData();

    if (!rawData || (Array.isArray(rawData) && rawData.length === 0) || (typeof rawData === 'object' && Object.keys(rawData).length === 0)) {
      console.log('⚠️ No data returned from Browse.ai');
      return;
    }

    // Extract products from captured data
    let products = [];

    // Check if data is in capturedTexts format (single text block)
    if (rawData[0] && typeof rawData[0] === 'object') {
      const capturedTexts = rawData[0];

      // Find the field with product data (usually longest text field)
      let productText = '';
      for (const [key, value] of Object.entries(capturedTexts)) {
        if (typeof value === 'string' && value.length > productText.length) {
          productText = value;
        }
      }

      if (productText) {
        console.log(`📄 Found product text (${productText.length} chars)`);
        const parsedProducts = parseSamsungProducts(productText);
        products = parsedProducts;
      }
    }
    // Check if data is in capturedLists format (structured data)
    else if (typeof rawData === 'object' && !Array.isArray(rawData)) {
      for (const [listName, listData] of Object.entries(rawData)) {
        if (Array.isArray(listData)) {
          console.log(`Found ${listData.length} items in list: ${listName}`);
          products = products.concat(listData);
        }
      }
    }

    if (products.length === 0) {
      console.log('⚠️ No products found in Browse.ai response');
      return;
    }

    console.log(`\n📦 Processing ${products.length} Samsung products...\n`);
    stats.total = products.length;

    // Process each product
    for (const rawProduct of products) {
      try {
        // Normalize the product data
        const product = normalizeSamsungProduct(rawProduct);

        if (!product.productName) {
          console.log(`⊘ Skipping invalid product: ${product.productName || 'Unknown'}`);
          stats.skipped++;
          continue;
        }

        // Check if product exists in Amazon or Flipkart
        const existingProduct = await ProductRepository.findProductInRetailers(product.productName);

        if (existingProduct.found) {
          // Update existing retailer table
          if (existingProduct.table === 'amazon') {
            await ProductRepository.updateAmazonWithSamsungData(product.productName, product);
            console.log(`✓ Updated in Amazon: ${product.productName}`);
            stats.updatedInAmazon++;
          } else if (existingProduct.table === 'flipkart') {
            await ProductRepository.updateFlipkartWithSamsungData(product.productName, product);
            console.log(`✓ Updated in Flipkart: ${product.productName}`);
            stats.updatedInFlipkart++;
          }
        } else {
          // Insert into samsung_products table
          const result = await ProductRepository.upsertSamsungProduct(product);
          const action = result.inserted ? 'Inserted' : 'Updated';
          console.log(`✓ ${action} in Samsung: ${product.productName}`);
          stats.insertedInSamsung++;
        }

      } catch (productError) {
        console.error(`✗ Error processing product:`, productError.message);
        stats.errors++;
      }
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n========================================');
    console.log('Ingestion Summary');
    console.log('========================================');
    console.log(`Total Products:         ${stats.total}`);
    console.log(`Updated in Amazon:      ${stats.updatedInAmazon}`);
    console.log(`Updated in Flipkart:    ${stats.updatedInFlipkart}`);
    console.log(`Inserted in Samsung:    ${stats.insertedInSamsung}`);
    console.log(`Skipped:                ${stats.skipped}`);
    console.log(`Errors:                 ${stats.errors}`);
    console.log(`Duration:               ${duration}s`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ Fatal error during Samsung ingestion:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  ingestSamsungData()
    .then(() => {
      console.log('✓ Samsung ingestion completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('✗ Samsung ingestion failed:', error);
      process.exit(1);
    });
}

module.exports = ingestSamsungData;
