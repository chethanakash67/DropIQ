const db = require('../database/db');

/**
 * Generate Store ID from phone number, shop name, and owner name
 * Format: first 4 digits of phone - first 2 letters of shop name - first 2 letters of owner name
 * Example: 9876-SI-SI
 */
function generateStoreId(phoneNumber, shopName, ownerName) {
  const phoneDigits = phoneNumber.replace(/\D/g, '').substring(0, 4);
  const shopInitials = shopName.trim().substring(0, 2).toUpperCase();
  const ownerInitials = ownerName.trim().substring(0, 2).toUpperCase();
  
  return `${phoneDigits}-${shopInitials}-${ownerInitials}`;
}

/**
 * Generate table name from store name
 * Format: store_name_o (lowercase, replace spaces with underscores)
 */
function generateTableName(storeName) {
  return storeName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50) // Limit length
    + '_o';
}

class OfflineStoreRepository {
  async getStoreByStoreId(storeId) {
    const query = 'SELECT * FROM offline_stores WHERE UPPER(store_id) = UPPER($1)';
    const result = await db.query(query, [storeId]);
    return result.rows[0];
  }

  /**
   * Create or update a store in the main table
   */
  async upsertStore(storeData) {
    const { storeId, storeName, ownerName, ownerPhone, shopLocation, preferredTime, tableName } = storeData;
    
    const query = `
      INSERT INTO offline_stores (store_id, store_name, owner_name, owner_phone, shop_location, preferred_time, table_name, last_synced_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (store_id)
      DO UPDATE SET
        store_name = EXCLUDED.store_name,
        owner_name = EXCLUDED.owner_name,
        owner_phone = EXCLUDED.owner_phone,
        shop_location = EXCLUDED.shop_location,
        preferred_time = EXCLUDED.preferred_time,
        last_synced_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    
    const result = await db.query(query, [storeId, storeName, ownerName, ownerPhone, shopLocation, preferredTime, tableName]);
    return result.rows[0];
  }

  /**
   * Create a new product table for a store
   */
  async createStoreProductTable(tableName) {
    const query = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        product_name TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_${tableName}_product_name ON ${tableName}(product_name);
    `;
    
    await db.query(query);
    console.log(`✓ Created table: ${tableName}`);
  }

  /**
   * Insert products into a store's table
   */
  async insertProducts(tableName, products) {
    if (!products || products.length === 0) {
      return;
    }

    // First, clear existing products (we're doing a full sync)
    await db.query(`DELETE FROM ${tableName}`);

    // Insert new products
    for (const product of products) {
      const query = `
        INSERT INTO ${tableName} (product_name, price)
        VALUES ($1, $2)
      `;
      await db.query(query, [product.name, product.price]);
    }

    console.log(`✓ Inserted ${products.length} products into ${tableName}`);
  }

  /**
   * Get all stores
   */
  async getAllStores() {
    const query = 'SELECT * FROM offline_stores ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get products from a store table
   */
  async getStoreProducts(tableName) {
    const query = `SELECT * FROM ${tableName} ORDER BY product_name`;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Check if a table exists
   */
  async tableExists(tableName) {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `;
    const result = await db.query(query, [tableName]);
    return result.rows[0].exists;
  }
}

const repository = new OfflineStoreRepository();

// Export repository instance with helper functions attached
repository.generateStoreId = generateStoreId;
repository.generateTableName = generateTableName;

module.exports = repository;
