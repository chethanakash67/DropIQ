const db = require('../database/db');

class UserItemsService {
  /**
   * Get all bag items for a user
   */
  async getBag(userId) {
    const query = 'SELECT * FROM bag_items WHERE user_id = $1 ORDER BY added_at DESC';
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Add a product to user's bag
   */
  async addToBag(userId, product) {
    const { id, product_name, price_inr, image_url, retailer_name } = product;
    const query = `
      INSERT INTO bag_items (user_id, product_id, product_name, price, image_url, retailer)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, product_id, retailer) DO NOTHING
      RETURNING *
    `;
    const result = await db.query(query, [
      userId, 
      String(id), 
      product_name || product.name, 
      parseFloat(String(price_inr || 0)) || null, 
      image_url, 
      retailer_name || product.retailer
    ]);
    return result.rows[0];
  }

  /**
   * Remove a product from user's bag
   */
  async removeFromBag(userId, productId, retailer) {
    const query = 'DELETE FROM bag_items WHERE user_id = $1 AND product_id = $2 AND retailer = $3';
    await db.query(query, [userId, String(productId), retailer]);
    return { success: true };
  }

  /**
   * Get all cart items for a user
   */
  async getCart(userId) {
    const query = 'SELECT * FROM cart_items WHERE user_id = $1 ORDER BY added_at DESC';
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Sync full bag with database
   */
  async syncBag(userId, items) {
    await db.query('BEGIN');
    try {
      await db.query('DELETE FROM bag_items WHERE user_id = $1', [userId]);
      
      for (const item of items) {
        const query = `
          INSERT INTO bag_items (user_id, product_id, product_name, price, image_url, retailer)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await db.query(query, [
          userId,
          String(item.id || item.product_id),
          item.product_name,
          parseFloat(String(item.price_inr || item.price || 0)) || null,
          item.image_url,
          item.retailer_name || item.retailer
        ]);
      }
      
      await db.query('COMMIT');
      return { success: true };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Sync full cart with database (overwrite or upsert)
   * This is called when the frontend cart changes
   */
  async syncCart(userId, items) {
    // Basic approach: delete and re-insert for the user
    // A more complex approach would be a merge, but this is simpler for MVP
    await db.query('BEGIN');
    try {
      await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
      
      for (const item of items) {
        const query = `
          INSERT INTO cart_items (user_id, product_id, product_name, price, image_url, retailer, quantity)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await db.query(query, [
          userId,
          String(item.id || item.product_id),
          item.product_name,
          parseFloat(String(item.price_inr || item.price || 0)) || null,
          item.image_url,
          item.retailer_name || item.retailer,
          item.quantity || 1
        ]);
      }
      
      await db.query('COMMIT');
      return { success: true };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Clear all items from bag and cart for a user
   */
  async clearUserItems(userId) {
    await db.query('BEGIN');
    try {
      await db.query('DELETE FROM bag_items WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
      await db.query('COMMIT');
      return { success: true };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = new UserItemsService();
