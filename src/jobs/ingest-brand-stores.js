require('dotenv').config();
const BrowseAiClient = require('../services/browseai-client');
const ProductRepository = require('../repositories/product-repository');

/**
 * Brand Store Data Ingestion Job
 * 
 * Purpose: Fetch products from brand stores (Samsung, Sony, etc.) and store them
 * - Checks for duplicates across all tables before inserting
 * - Updates existing products if found in Amazon/Flipkart
 * - Inserts into brand-specific table if not found elsewhere
 */

// Helper: Determine category from product name/description
function determineCategory(productName, description = '') {
  const text = `${productName} ${description}`.toLowerCase();

  if (text.includes('robot') && text.includes('vacuum')) return 'robot_vacuums';
  if (text.includes('neckband')) return 'neckbands';
  if (text.includes('earbud') || text.includes('ear bud') || text.includes('buds')) return 'earbuds';
  if (text.includes('wired') && (text.includes('earphone') || text.includes('headphone'))) return 'wired_earphones';
  if (text.includes('headphone') || text.includes('headset')) return 'headphones';

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

// Product counters for each brand
const productCounters = {
  samsung: {},
  sony: {}
};

// Helper: Generate brand product ID
function generateBrandProductId(brand, category) {
  const brandCode = brand.toLowerCase().substring(0, 3);
  const categoryCode = getCategoryCode(category);

  if (!productCounters[brand.toLowerCase()]) {
    productCounters[brand.toLowerCase()] = {};
  }

  if (!productCounters[brand.toLowerCase()][categoryCode]) {
    productCounters[brand.toLowerCase()][categoryCode] = 1;
  }

  const serial = String(productCounters[brand.toLowerCase()][categoryCode]).padStart(2, '0');
  productCounters[brand.toLowerCase()][categoryCode]++;

  return `${brandCode}_${categoryCode}_${serial}`;
}

// Helper: Parse products from captured text
function parseProductsFromText(capturedText, brand) {
  const products = [];

  // Pattern varies by brand, but generally looks for product blocks
  const productBlocks = capturedText.split(/(?=(?:PICK\n)?Quick Look\n)/g);

  for (const block of productBlocks) {
    if (block.trim().length < 20) continue;

    const product = {};

    // Extract product name
    const nameMatch = block.match(/Quick Look\n([^\n]+?)(?:\nProduct Ratings|Colour|\n|$)/);
    if (nameMatch) {
      product.name = nameMatch[1].trim();
    } else {
      continue;
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

    // Extract price
    const priceMatch = block.match(/Total Price:\s*₹([\d,]+\.?\d*)|MRP:\s*₹([\d,]+\.?\d*)/);
    if (priceMatch) {
      const priceStr = (priceMatch[1] || priceMatch[2]).replace(/,/g, '');
      product.price = parseFloat(priceStr);
    } else {
      product.price = null;
    }

    // Extract colors
    const colorMatch = block.match(/Colour\s*:\s*([^\n]+)/);
    if (colorMatch) {
      product.colors = colorMatch[1].split('\n')[0].trim();
    }

    product.brand = brand;

    // Availability
    if (block.includes('Notify me')) {
      product.availability = 'out_of_stock';
    } else {
      product.availability = 'in_stock';
    }

    if (product.name) {
      products.push(product);
    }
  }

  return products;
}

// Helper: Normalize brand product
function normalizeBrandProduct(parsedProduct, brand) {
  const category = determineCategory(parsedProduct.name);
  const productId = generateBrandProductId(brand, category);

  // Generate URL based on brand
  let urlCategory = 'others';
  const productSlug = parsedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  let productUrl = parsedProduct.productUrl || '';
  if (!productUrl) {
    if (brand.toLowerCase() === 'samsung') {
      urlCategory = parsedProduct.name.toLowerCase().includes('galaxy buds') ? 'galaxy-buds' : 'others';
      productUrl = `https://www.samsung.com/in/audio-sound/${urlCategory}/${productSlug}/`;
    } else if (brand.toLowerCase() === 'sony') {
      productUrl = `https://www.sony.co.in/electronics/${productSlug}`;
    }
  }

  // Build features JSONB from array or keep existing
  let features = null;
  if (Array.isArray(parsedProduct.features) && parsedProduct.features.length > 0) {
    features = parsedProduct.features; // Keep as array
  } else if (parsedProduct.colors) {
    features = [`Available in: ${parsedProduct.colors}`]; // Wrap in array
  }

  return {
    productName: parsedProduct.name,
    brand: brand,
    productId: productId,
    category,
    priceInr: parsedProduct.price,
    rating: parsedProduct.rating || null,
    reviewsCount: parsedProduct.reviewsCount || null,
    description: parsedProduct.colors ? `Available in: ${parsedProduct.colors}` : null,
    features: features,
    specifications: null,
    imageUrl: parsedProduct.imageUrl || null,
    productUrl: productUrl,
    availabilityStatus: parsedProduct.availability || 'in_stock'
  };
}

// Helper: Check for duplicates across Samsung and Sony tables
async function checkBrandDuplicates(productName, currentBrand) {
  try {
    // Check Samsung table if current brand is not Samsung
    if (currentBrand.toLowerCase() !== 'samsung') {
      const samsungCheck = await ProductRepository.findProductInBrandTable('samsung', productName);
      if (samsungCheck.found) {
        return { found: true, brand: 'samsung', data: samsungCheck.data };
      }
    }

    // Check Sony table if current brand is not Sony
    if (currentBrand.toLowerCase() !== 'sony') {
      const sonyCheck = await ProductRepository.findProductInBrandTable('sony', productName);
      if (sonyCheck.found) {
        return { found: true, brand: 'sony', data: sonyCheck.data };
      }
    }

    return { found: false };
  } catch (error) {
    console.error('Error checking brand duplicates:', error);
    return { found: false };
  }
}

async function ingestBrandStores() {
  console.log('\n========================================');
  console.log('Brand Stores Data Ingestion');
  console.log('========================================\n');

  const startTime = Date.now();
  const stats = {
    samsung: { total: 0, inserted: 0, updated: 0, duplicates: 0, errors: 0 },
    sony: { total: 0, inserted: 0, updated: 0, duplicates: 0, errors: 0 }
  };

  try {
    const apiKey = process.env.BROWSEAI_API_KEY;

    // Process Samsung
    console.log('📱 Processing Samsung Store...\n');
    const samsungRobotId = process.env.BROWSEAI_SAMSUNG_ROBOT_ID;
    const samsungTaskId = process.env.BROWSEAI_SAMSUNG_TASK_ID;

    if (samsungRobotId && samsungTaskId) {
      const samsungClient = new BrowseAiClient(apiKey, samsungRobotId, samsungTaskId);
      const samsungData = await samsungClient.fetchTaskData();

      console.log('Samsung data type:', Array.isArray(samsungData) ? 'Array' : typeof samsungData);
      console.log('Samsung data keys:', samsungData && typeof samsungData === 'object' ? Object.keys(samsungData) : 'N/A');

      let samsungProducts = [];

      // Check if data is in capturedLists format (structured data)
      if (samsungData && typeof samsungData === 'object' && !Array.isArray(samsungData)) {
        // capturedLists - each list might contain product data
        for (const [listName, listData] of Object.entries(samsungData)) {
          console.log(`Processing list: ${listName}, items: ${Array.isArray(listData) ? listData.length : 'N/A'}`);

          if (Array.isArray(listData) && listData.length > 0) {
            // Each item in the list is a product
            for (const item of listData) {
              const product = {
                name: item['Product Name'] || item['product name'] || item.name || item.title || '',
                price: null,
                rating: null,
                reviewsCount: null,
                colors: null,
                brand: 'Samsung',
                availability: 'in_stock',
                imageUrl: null,
                productUrl: null,
                features: []
              };

              // Extract current price
              const originalPriceField = item['Original Price'] || item['MRP'] || item['Price'];
              if (originalPriceField) {
                const priceMatch = String(originalPriceField).match(/[\d,]+\.?\d*/);
                if (priceMatch) {
                  product.price = parseFloat(priceMatch[0].replace(/,/g, ''));
                }
              }

              // If still no price, try Current Price field
              if (!product.price) {
                const currentPriceField = item['Current Price'] || item.price;
                if (currentPriceField && !String(currentPriceField).includes('Save')) {
                  const priceMatch = String(currentPriceField).match(/[\d,]+\.?\d*/);
                  if (priceMatch) {
                    product.price = parseFloat(priceMatch[0].replace(/,/g, ''));
                  }
                }
              }

              // Extract rating
              const ratingField = item['Product Ratings'] || item['Rating'] || item.rating;
              if (ratingField) {
                const ratingMatch = String(ratingField).match(/[\d.]+/);
                if (ratingMatch) {
                  product.rating = parseFloat(ratingMatch[0]);
                }
              }

              // Extract reviews count
              const reviewsField = item['Number of Ratings'] || item['Reviews'] || item.reviews;
              if (reviewsField) {
                const reviewsMatch = String(reviewsField).match(/[\d,]+/);
                if (reviewsMatch) {
                  product.reviewsCount = parseInt(reviewsMatch[0].replace(/,/g, ''));
                }
              }

              // Extract colors
              const colorField = item['Color'] || item['Colour'] || item.color;
              if (colorField) {
                product.colors = String(colorField);
              }

              // Extract product image (use first available image)
              let imageUrl = null;
              for (let i = 1; i <= 6; i++) {
                const imageField = item[`Product Image ${i}`] || item[`Image ${i}`];
                if (imageField && String(imageField).trim()) {
                  imageUrl = String(imageField).trim();
                  break;
                }
              }
              product.imageUrl = imageUrl;

              // Extract product URL
              const urlField = item['Product Link'] || item['product link'] || item['URL'];
              if (urlField) {
                product.productUrl = String(urlField).trim();
              }

              if (product.name) {
                samsungProducts.push(product);
              }
            }
          }
        }
      }
      // Check if data is in capturedTexts format (text block) - old format
      else if (samsungData && Array.isArray(samsungData) && samsungData.length > 0 && samsungData[0]) {
        const capturedTexts = samsungData[0];
        let productText = '';

        for (const [key, value] of Object.entries(capturedTexts)) {
          if (typeof value === 'string' && value.length > productText.length) {
            productText = value;
          }
        }

        if (productText) {
          samsungProducts = parseProductsFromText(productText, 'Samsung');
        }
      }

      stats.samsung.total = samsungProducts.length;
      console.log(`Found ${samsungProducts.length} Samsung products\n`);

      for (const rawProduct of samsungProducts) {
        try {
          const product = normalizeBrandProduct(rawProduct, 'Samsung');

          if (!product.productName) {
            stats.samsung.errors++;
            continue;
          }

          // Check for duplicates in brand tables
          const brandDuplicate = await checkBrandDuplicates(product.productName, 'Samsung');
          if (brandDuplicate.found) {
            console.log(`⊗ Duplicate in ${brandDuplicate.brand}: ${product.productName}`);
            stats.samsung.duplicates++;
            continue;
          }

          // Check if exists in Amazon/Flipkart
          const retailerProduct = await ProductRepository.findProductInRetailers(product.productName);

          if (retailerProduct.found) {
            if (retailerProduct.table === 'amazon') {
              await ProductRepository.updateAmazonWithSamsungData(product.productName, product);
              console.log(`✓ Updated Amazon: ${product.productName}`);
            } else {
              await ProductRepository.updateFlipkartWithSamsungData(product.productName, product);
              console.log(`✓ Updated Flipkart: ${product.productName}`);
            }
            stats.samsung.updated++;
          } else {
            await ProductRepository.upsertSamsungProduct(product);
            console.log(`✓ Inserted Samsung: ${product.productName}`);
            stats.samsung.inserted++;
          }
        } catch (error) {
          console.error(`✗ Error processing Samsung product:`, error.message);
          stats.samsung.errors++;
        }
      }
    }

    console.log('\n📱 Processing Sony Store...\n');
    const sonyRobotId = process.env.BROWSEAI_SONY_ROBOT_ID;
    const sonyTaskId = process.env.BROWSEAI_SONY_TASK_ID;

    if (sonyRobotId && sonyTaskId) {
      const sonyClient = new BrowseAiClient(apiKey, sonyRobotId, sonyTaskId);
      const sonyData = await sonyClient.fetchTaskData();

      console.log('Sony data type:', Array.isArray(sonyData) ? 'Array' : typeof sonyData);
      console.log('Sony data keys:', sonyData && typeof sonyData === 'object' ? Object.keys(sonyData) : 'N/A');

      let sonyProducts = [];

      // Check if data is in capturedLists format (structured data)
      if (sonyData && typeof sonyData === 'object' && !Array.isArray(sonyData)) {
        // capturedLists - each list might contain product data
        for (const [listName, listData] of Object.entries(sonyData)) {
          console.log(`Processing list: ${listName}, items: ${Array.isArray(listData) ? listData.length : 'N/A'}`);

          if (Array.isArray(listData) && listData.length > 0) {
            // Each item in the list is a product
            for (const item of listData) {
              const product = {
                name: item['Product Name-4'] || item['Product Name'] || item['product name'] || item.name || item.title || '',
                price: null,
                rating: null,
                reviewsCount: null,
                colors: null,
                brand: 'Sony',
                availability: 'in_stock',
                imageUrl: null,
                productUrl: null,
                features: []
              };

              // Extract price
              const priceField = item['Price-4'] || item['Price'] || item.price || item['Total Price'] || item['MRP'];
              if (priceField) {
                const priceMatch = String(priceField).match(/[\d,]+\.?\d*/);
                if (priceMatch) {
                  product.price = parseFloat(priceMatch[0].replace(/,/g, ''));
                }
              }

              // Extract rating
              const ratingField = item['Rating-4'] || item['Rating'] || item.rating || item['Product Rating'];
              if (ratingField) {
                const ratingMatch = String(ratingField).match(/[\d.]+/);
                if (ratingMatch) {
                  product.rating = parseFloat(ratingMatch[0]);
                }
              }

              // Extract reviews
              const reviewsField = item['Review Count-3'] || item['Reviews'] || item.reviews || item['Review Count'] || item['Number of Ratings'];
              if (reviewsField) {
                const reviewsMatch = String(reviewsField).match(/[\d,]+/);
                if (reviewsMatch) {
                  product.reviewsCount = parseInt(reviewsMatch[0].replace(/,/g, ''));
                }
              }

              // Extract colors
              const colorField = item['Color-4'] || item['Color'] || item['Colour'] || item.color || item.colours;
              if (colorField) {
                product.colors = String(colorField);
              }

              // Extract image URL
              const imageField = item['Image-3'] || item['Image'] || item['image'] || item['Product Image'];
              if (imageField) {
                product.imageUrl = String(imageField).trim();
              }

              // Extract product URL
              const urlField = item['Product Link-4'] || item['Product Link'] || item['product link'] || item['URL'];
              if (urlField) {
                product.productUrl = String(urlField).trim();
              }

              // Extract features (Features 1, Features 2, Features 3)
              const features = [];
              for (let i = 1; i <= 3; i++) {
                const featureField = item[`Features ${i}`] || item[`Feature ${i}`];
                if (featureField && String(featureField).trim()) {
                  features.push(String(featureField).trim());
                }
              }
              if (features.length > 0) {
                product.features = features;
              }

              if (product.name) {
                sonyProducts.push(product);
              }
            }
          }
        }
      }
      // Check if data is in capturedTexts format (text block)
      else if (sonyData && Array.isArray(sonyData) && sonyData.length > 0 && sonyData[0]) {
        const capturedTexts = sonyData[0];
        let productText = '';

        for (const [key, value] of Object.entries(capturedTexts)) {
          if (typeof value === 'string' && value.length > productText.length) {
            productText = value;
          }
        }

        if (productText) {
          sonyProducts = parseProductsFromText(productText, 'Sony');
        }
      }

      stats.sony.total = sonyProducts.length;
      console.log(`Found ${sonyProducts.length} Sony products\n`);

      for (const rawProduct of sonyProducts) {
        try {
          const product = normalizeBrandProduct(rawProduct, 'Sony');

          if (!product.productName) {
            stats.sony.errors++;
            continue;
          }

          // Check for duplicates in brand tables
          const brandDuplicate = await checkBrandDuplicates(product.productName, 'Sony');
          if (brandDuplicate.found) {
            console.log(`⊗ Duplicate in ${brandDuplicate.brand}: ${product.productName}`);
            stats.sony.duplicates++;
            continue;
          }

          // Check if exists in Amazon/Flipkart
          const retailerProduct = await ProductRepository.findProductInRetailers(product.productName);

          if (retailerProduct.found) {
            if (retailerProduct.table === 'amazon') {
              await ProductRepository.updateAmazonWithSamsungData(product.productName, product);
              console.log(`✓ Updated Amazon: ${product.productName}`);
            } else {
              await ProductRepository.updateFlipkartWithSamsungData(product.productName, product);
              console.log(`✓ Updated Flipkart: ${product.productName}`);
            }
            stats.sony.updated++;
          } else {
            await ProductRepository.upsertSonyProduct(product);
            console.log(`✓ Inserted Sony: ${product.productName}`);
            stats.sony.inserted++;
          }
        } catch (error) {
          console.error(`✗ Error processing Sony product:`, error.message);
          stats.sony.errors++;
        }
      }
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n========================================');
    console.log('Brand Ingestion Summary');
    console.log('========================================');
    console.log('Samsung:');
    console.log(`  Total:      ${stats.samsung.total}`);
    console.log(`  Inserted:   ${stats.samsung.inserted}`);
    console.log(`  Updated:    ${stats.samsung.updated}`);
    console.log(`  Duplicates: ${stats.samsung.duplicates}`);
    console.log(`  Errors:     ${stats.samsung.errors}`);
    console.log('\nSony:');
    console.log(`  Total:      ${stats.sony.total}`);
    console.log(`  Inserted:   ${stats.sony.inserted}`);
    console.log(`  Updated:    ${stats.sony.updated}`);
    console.log(`  Duplicates: ${stats.sony.duplicates}`);
    console.log(`  Errors:     ${stats.sony.errors}`);
    console.log(`\nDuration: ${duration}s`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ Fatal error during brand ingestion:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  ingestBrandStores()
    .then(() => {
      console.log('✓ Brand ingestion completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('✗ Brand ingestion failed:', error);
      process.exit(1);
    });
}

module.exports = ingestBrandStores;
