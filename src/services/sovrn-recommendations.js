const axios = require('axios');
const sovrnAffiliate = require('../utils/sovrn-affiliate');

/**
 * Sovrn Product Recommendations Service
 * Fetches AI-powered product recommendations using Sovrn's API
 */
class SovrnRecommendations {
  constructor() {
    this.apiKey = process.env.SOVRN_API_KEY;
    this.baseUrl = 'https://shopping-gallery.prd-commerce.sovrnservices.com/ai-orchestration/products';
    this.market = 'usd_en'; // Default market
    this.usdToInrRate = 83; // Approximate conversion rate
  }

  /**
   * Calculate price range for recommendations (±30% of original price)
   * @param {number} priceInr - Original product price in INR
   * @returns {string} Price range in USD format "min-max"
   */
  calculatePriceRange(priceInr) {
    const priceUsd = priceInr / this.usdToInrRate;
    const minPrice = Math.floor(priceUsd * 0.7); // -30%
    const maxPrice = Math.ceil(priceUsd * 1.3);  // +30%
    return `${minPrice}-${maxPrice}`;
  }

  /**
   * Generate content string from product details
   * @param {object} product - Product details
   * @returns {string} Formatted content for API
   */
  generateContent(product) {
    const parts = [];

    if (product.product_name) parts.push(product.product_name);
    if (product.category) parts.push(`Category: ${product.category}`);
    if (product.price_inr) parts.push(`Price: ₹${product.price_inr}`);
    if (product.description) {
      // Get first 100 chars of description
      const shortDesc = product.description.substring(0, 100);
      parts.push(shortDesc);
    }

    return parts.join('. ');
  }

  /**
   * Fetch product recommendations from Sovrn API
   * @param {object} product - Product details (name, price, description, category)
   * @param {string} productId - Unique identifier for caching
   * @returns {Promise<Array>} Array of recommended products
   */
  async getRecommendations(product, productId) {
    if (!this.apiKey) {
      console.warn('SOVRN_API_KEY not configured for recommendations');
      return [];
    }

    try {
      const content = this.generateContent(product);
      const priceRange = this.calculatePriceRange(product.price_inr);
      const priceMin = priceRange.split('-')[0];
      const priceMax = priceRange.split('-')[1];

      // Generate stable pageUrl for caching (must be full URL)
      const pageUrl = `https://dropiq01.vercel.app/product/${productId}`;

      const requestBody = {
        title: product.product_name || 'Product',
        content: content
      };

      console.log(`Fetching recommendations for: ${product.product_name} (Price: ₹${product.price_inr})`);

      const response = await axios.post(
        this.baseUrl,
        requestBody,
        {
          params: {
            apiKey: this.apiKey,
            pageUrl: pageUrl,
            numProducts: 5,
            market: this.market,
            priceMin: priceMin,
            priceMax: priceMax,
            cuid: productId
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      if (!response.data || !Array.isArray(response.data)) {
        console.warn('Invalid response from Sovrn API');
        return [];
      }

      // Transform and enrich recommendations
      const recommendations = response.data.map(item => {
        // Convert USD to INR
        const priceInr = item.salePrice ? Math.round(parseFloat(item.salePrice) * this.usdToInrRate) : null;

        return {
          name: item.name || 'Product',
          price_inr: priceInr,
          image_url: item.imageURL || item.thumbnailURL || null,
          product_url: item.deepLink || null, // Already an affiliate link from Sovrn
          affiliate_url: item.deepLink || null, // Sovrn provides pre-generated affiliate links
          merchant: item.merchant?.name || 'Unknown',
          merchant_id: item.merchant?.id || null,
          in_stock: item.inStock || false
        };
      });

      console.log(`✓ Fetched ${recommendations.length} recommendations`);
      return recommendations;

    } catch (error) {
      if (error.response) {
        console.error('Sovrn API error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Sovrn API no response:', error.message);
      } else {
        console.error('Sovrn API request error:', error.message);
      }
      return [];
    }
  }

  /**
   * Batch fetch recommendations for multiple products
   * @param {Array} products - Array of product objects
   * @returns {Promise<Object>} Map of productId -> recommendations
   */
  async getBatchRecommendations(products) {
    const results = {};

    for (const product of products) {
      const productId = product.id || product.asin || product.product_id;
      const recommendations = await this.getRecommendations(product, productId);
      results[productId] = recommendations;

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
  }
}

module.exports = new SovrnRecommendations();
