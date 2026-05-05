const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { db } = require('../database/db');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ImageAnalyzer {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.cache = new Map(); // Simple in-memory cache to avoid reprocessing the same image
  }

  /**
   * Download image from URL and convert to base64
   */
  async downloadImageAsBase64(imageUrl) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      return `data:${response.headers['content-type']};base64,${base64}`;
    } catch (error) {
      console.error(`Error downloading image from ${imageUrl}:`, error.message);
      return null;
    }
  }

  /**
   * Analyze image to determine product category
   */
  async analyzeImage(imageUrl) {
    // Check cache first
    if (this.cache.has(imageUrl)) {
      return this.cache.get(imageUrl);
    }

    try {
      const imageBase64 = await this.downloadImageAsBase64(imageUrl);
      if (!imageBase64) return null;

      const prompt = `Analyze this product image and determine which category it belongs to. 
        Choose ONE of these categories: 'headphones', 'earbuds', 'neckbands', 'wired_earphones', 'robot_vacuums'.
        Only respond with the category name in lowercase, nothing else.`;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64.split(',')[1] // Remove the data URL prefix
          }
        }
      ]);

      const response = await result.response;
      const category = response.text().trim().toLowerCase();
      
      // Validate category
      const validCategories = ['headphones', 'earbuds', 'neckbands', 'wired_earphones', 'robot_vacuums'];
      const finalCategory = validCategories.includes(category) ? category : null;
      
      // Cache the result
      this.cache.set(imageUrl, finalCategory);
      
      return finalCategory;
    } catch (error) {
      console.error('Error analyzing image with Gemini:', error);
      return null;
    }
  }

  /**
   * Update product category in the database
   */
  async updateProductCategory(table, productId, category) {
    try {
      const query = `
        UPDATE ${table} 
        SET category = $1, 
            detected_category = true,
            last_updated = NOW() 
        WHERE id = $2
        RETURNING id, product_name, category`;
      
      const result = await db.query(query, [category, productId]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating category for ${table} ID ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Process products and update their categories based on image analysis
   */
  async processProducts(limit = 10) {
    const tables = ['amazon_products', 'flipkart_products', 'samsung_products', 'sony_products'];
    
    for (const table of tables) {
      try {
        console.log(`\nProcessing products from ${table}...`);
        
        // Get products that haven't had their category detected yet
        const query = `
          SELECT id, product_name, image_url, category 
          FROM ${table} 
          WHERE (detected_category IS NULL OR detected_category = false)
            AND image_url IS NOT NULL
            AND image_url != ''
          LIMIT $1`;
        
        const result = await db.query(query, [limit]);
        
        for (const product of result.rows) {
          try {
            console.log(`\nAnalyzing ${product.product_name} (${table})`);
            console.log(`Current category: ${product.category}`);
            console.log(`Image URL: ${product.image_url}`);
            
            const detectedCategory = await this.analyzeImage(product.image_url);
            
            if (detectedCategory && detectedCategory !== product.category) {
              console.log(`Updating category from '${product.category}' to '${detectedCategory}'`);
              const updated = await this.updateProductCategory(table, product.id, detectedCategory);
              console.log(`Updated:`, updated);
            } else if (detectedCategory === product.category) {
              console.log(`Category already correct: ${detectedCategory}`);
              // Still update to mark as processed
              await this.updateProductCategory(table, product.id, product.category);
            } else {
              console.log('Could not determine category from image');
            }
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            console.error(`Error processing product ${product.id}:`, error);
            // Continue with next product on error
            continue;
          }
        }
        
      } catch (error) {
        console.error(`Error processing table ${table}:`, error);
        // Continue with next table on error
        continue;
      }
    }
    
    console.log('\nImage analysis completed!');
  }
}

module.exports = new ImageAnalyzer();
