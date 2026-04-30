require('dotenv').config();
const googleSheetsService = require('../services/google-sheets-service');
const offlineStoreRepository = require('../repositories/offline-store-repository');

let activeSyncPromise = null;
let lastSyncStartedAt = null;
let lastSyncCompletedAt = null;
let lastSyncError = null;
let lastSyncSource = null;

/**
 * Parse products string from the Google Sheet
 * Format: "Product Name - Rs. Price\nProduct Name - Rs Price"
 * Returns array of {name, price} objects
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

    // Match pattern: "Product Name - Rs. 14,999" or "Product Name - Rs 14999" or "Product Name - RS 22,100"
    const match = trimmedLine.match(/^(.+?)\s*-\s*Rs\.?\s*([\d,]+)/i);
    
    if (match) {
      const productName = match[1].trim();
      const priceStr = match[2].replace(/,/g, ''); // Remove commas from price
      const price = parseFloat(priceStr);

      if (productName && !isNaN(price)) {
        products.push({
          name: productName,
          price: price
        });
      }
    }
  }

  return products;
}

/**
 * Process a single row from the Google Sheet
 */
async function processStoreRow(row) {
  try {
    // Extract data from the row
    const timestamp = row['Timestamp'];
    const shopName = row['Shop name']?.trim();
    const ownerName = row["Owner's Full Name"]?.trim();
    const ownerPhone = row["Owner's Phone Number (for Store ID generation)"]?.trim();
    const shopLocation = row["Shop Location / Address (Include Street, City, and Postal Code)"]?.trim();
    const preferredTime = row['Preferred Time for Follow-up Call (Optional)']?.trim();
    let storeId = row['Enter the Store ID']?.trim();
    const productsString = row['Enter the products : \nProd name including model - Price you sell.']?.trim();

    // Skip if no essential data
    if (!shopName && !storeId && !productsString) {
      console.log('⚠ Skipping empty row');
      return;
    }

    // Case 1: Row has products but no store information - use Form Your Store ID or skip
    if (productsString && !shopName) {
      storeId = row['Form Your Store ID']?.trim() || storeId;
      if (!storeId) {
        console.log('⚠ Skipping row with products but no Store ID or shop information');
        return;
      }

      // Find existing store by Store ID
      const existingStore = await offlineStoreRepository.getStoreByStoreId(storeId);
      if (existingStore) {
        const products = parseProducts(productsString);
        if (products.length > 0) {
          await offlineStoreRepository.insertProducts(existingStore.table_name, products);
          console.log(`✓ Updated products for store: ${existingStore.store_name} (${storeId})`);
        }
      } else {
        console.log(`⚠ Store ID ${storeId} not found in database, skipping products`);
      }
      return;
    }

    // Case 2: Row has shop information - create or update store
    if (shopName && ownerName && ownerPhone) {
      // Generate Store ID if not provided
      if (!storeId) {
        storeId = offlineStoreRepository.generateStoreId(ownerPhone, shopName, ownerName);
        console.log(`Generated Store ID: ${storeId} for shop: ${shopName}`);
      }

      // Generate table name
      const tableName = offlineStoreRepository.generateTableName(shopName);

      // Create or update store
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
      console.log(`✓ Upserted store: ${shopName} (${storeId})`);

      // Create store products table if it doesn't exist
      const tableExists = await offlineStoreRepository.tableExists(tableName);
      if (!tableExists) {
        await offlineStoreRepository.createStoreProductTable(tableName);
      }

      // Parse and insert products if provided
      if (productsString) {
        const products = parseProducts(productsString);
        if (products.length > 0) {
          await offlineStoreRepository.insertProducts(tableName, products);
        }
      }
    }
  } catch (error) {
    console.error('Error processing row:', error);
    console.error('Row data:', row);
  }
}

/**
 * Main sync function - fetches data from Google Sheets and syncs to database
 */
async function syncOfflineStores(options = {}) {
  const source = options.source || 'manual';

  if (activeSyncPromise) {
    console.log(`⚠ Offline Stores Sync already running. Reusing active run (requested by: ${source})`);
    return activeSyncPromise;
  }

  lastSyncStartedAt = new Date().toISOString();
  lastSyncSource = source;
  lastSyncError = null;

  activeSyncPromise = (async () => {
    try {
      console.log('\n========================================');
      console.log(`Starting Offline Stores Sync (source: ${source})`);
      console.log('========================================\n');

      // Get spreadsheet ID from environment variable
      const spreadsheetId = process.env.GOOGLE_SHEETS_STORE_REGISTRATION_ID;

      if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEETS_STORE_REGISTRATION_ID not found in environment variables');
      }

      console.log('Fetching data from Google Sheets...');

      // Fetch data from the sheet
      const sheetData = await googleSheetsService.fetchSheetData(spreadsheetId, 'Form responses 1');

      console.log(`✓ Fetched ${sheetData.length} rows from Google Sheets\n`);

      // Process each row
      for (let i = 0; i < sheetData.length; i++) {
        console.log(`\nProcessing row ${i + 1}/${sheetData.length}:`);
        await processStoreRow(sheetData[i]);
      }

      console.log('\n========================================');
      console.log('✓ Offline Stores Sync Completed Successfully');
      console.log('========================================\n');
      lastSyncCompletedAt = new Date().toISOString();
    } catch (error) {
      lastSyncError = error.message;
      console.error('\n========================================');
      console.error('✗ Offline Stores Sync Failed');
      console.error('========================================');
      console.error('Error:', error);
      throw error;
    } finally {
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
}

async function triggerStoreSync(options = {}) {
  const source = options.source || 'webhook';
  if (activeSyncPromise) {
    return {
      accepted: false,
      inProgress: true,
      source,
      message: 'Sync already in progress'
    };
  }

  // Fire and forget so webhooks can return fast.
  syncOfflineStores({ source }).catch((error) => {
    console.error(`Background sync failed (source: ${source})`, error.message);
  });

  return {
    accepted: true,
    inProgress: true,
    source,
    message: 'Sync started'
  };
}

function getStoreSyncStatus() {
  return {
    inProgress: !!activeSyncPromise,
    lastSyncStartedAt,
    lastSyncCompletedAt,
    lastSyncError,
    lastSyncSource
  };
}

// Run sync if called directly
if (require.main === module) {
  syncOfflineStores()
    .then(() => {
      console.log('Sync completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sync failed:', error);
      process.exit(1);
    });
}

module.exports = {
  syncOfflineStores,
  triggerStoreSync,
  getStoreSyncStatus,
  parseProducts
};
