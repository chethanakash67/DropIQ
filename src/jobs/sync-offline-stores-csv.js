require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const offlineStoreRepository = require('../repositories/offline-store-repository');

/**
 * Parse products string from CSV
 */
function parseProducts(productsString) {
  if (!productsString || productsString.trim() === '') {
    return [];
  }

  const products = [];
  const lines = productsString.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const match = trimmedLine.match(/^(.+?)\s*-\s*Rs\.?\s*([\d,]+)/i);
    
    if (match) {
      const productName = match[1].trim();
      const priceStr = match[2].replace(/,/g, '');
      const price = parseFloat(priceStr);

      if (productName && !isNaN(price)) {
        products.push({ name: productName, price: price });
      }
    }
  }

  return products;
}

/**
 * Parse CSV file using csv-parse library
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true
  });
  return records;
}

/**
 * Process a single store row
 */
async function processStoreRow(row) {
  try {
    const timestamp = row['Timestamp'];
    const shopName = row['Shop Name']?.trim();
    const ownerName = row["Owner's Full Name"]?.trim();
    const ownerPhone = row["Owner's Phone Number (for Store ID generation)"]?.trim();
    const shopLocation = row["Shop Location / Address (Include Street, City, and Postal Code)"]?.trim();
    const preferredTime = row['Preferred Time for Follow-up Call (Optional)']?.trim();
    let storeId = row['Enter the Store ID']?.trim();
    const productsString = row['Enter the products : \nProd name including model - Price you sell.']?.trim();
    const formYourStoreId = row['Form Your Store ID']?.trim();

    if (!shopName && !storeId && !productsString && !formYourStoreId) {
      console.log('⚠ Skipping empty row');
      return;
    }

    // Row with products but no shop info
    if (productsString && !shopName) {
      storeId = formYourStoreId || storeId;
      if (!storeId) {
        console.log('⚠ Skipping row with products but no Store ID');
        return;
      }

      const existingStore = await offlineStoreRepository.getStoreByStoreId(storeId);
      if (existingStore) {
        const products = parseProducts(productsString);
        if (products.length > 0) {
          await offlineStoreRepository.insertProducts(existingStore.table_name, products);
          console.log(`✓ Updated ${products.length} products for store: ${existingStore.store_name} (${storeId})`);
        }
      } else {
        console.log(`⚠ Store ID ${storeId} not found, skipping products`);
      }
      return;
    }

    // Row with shop information
    if (shopName && ownerName && ownerPhone) {
      if (!storeId) {
        storeId = offlineStoreRepository.generateStoreId(ownerPhone, shopName, ownerName);
        console.log(`📝 Generated Store ID: ${storeId}`);
      }

      const tableName = offlineStoreRepository.generateTableName(shopName);

      const storeData = {
        storeId,
        storeName: shopName,
        ownerName,
        ownerPhone,
        shopLocation: shopLocation || '',
        preferredTime: preferredTime || null,
        tableName
      };

      await offlineStoreRepository.upsertStore(storeData);
      console.log(`✓ Store created/updated: ${shopName} (${storeId})`);

      const tableExists = await offlineStoreRepository.tableExists(tableName);
      if (!tableExists) {
        await offlineStoreRepository.createStoreProductTable(tableName);
      }

      if (productsString) {
        const products = parseProducts(productsString);
        if (products.length > 0) {
          await offlineStoreRepository.insertProducts(tableName, products);
          console.log(`✓ Inserted ${products.length} products into ${tableName}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error processing row:', error.message);
    console.error('Stack:', error.stack);
  }
}

/**
 * Main sync from CSV
 */
async function syncFromCSV() {
  try {
    console.log('\n========================================');
    console.log('📊 Starting Offline Stores Sync from CSV');
    console.log('========================================\n');

    const csvPath = path.join(__dirname, '..', '..', 'New Shop Registration Form (Responses) - Form responses 1.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    console.log(`📂 Reading CSV file: ${csvPath}`);
    const rows = parseCSV(csvPath);
    console.log(`✓ Parsed ${rows.length} rows from CSV\n`);

    for (let i = 0; i < rows.length; i++) {
      console.log(`\n--- Processing Row ${i + 1}/${rows.length} ---`);
      await processStoreRow(rows[i]);
    }

    console.log('\n========================================');
    console.log('✅ CSV Sync Completed Successfully!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ CSV Sync Failed');
    console.error('========================================');
    console.error('Error:', error.message);
    throw error;
  }
}

if (require.main === module) {
  syncFromCSV()
    .then(() => {
      console.log('Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { syncFromCSV };
