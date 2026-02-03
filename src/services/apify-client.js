require('dotenv').config();
const axios = require('axios');

class ApifyClient {
  constructor() {
    this.apiToken = process.env.APIFY_API_TOKEN;

    if (!this.apiToken) {
      throw new Error('APIFY_API_TOKEN is required in .env');
    }

    // Get endpoints from environment
    const amazonEndpoint = process.env.AMAZON_API_ENDPOINT;
    const flipkartEndpoint = process.env.FLIPKART_API_ENDPOINT;
    const amazonLimit = parseInt(process.env.AMAZON_PRODUCT_LIMIT || '500');
    const flipkartLimit = parseInt(process.env.FLIPKART_PRODUCT_LIMIT || '450');

    if (!amazonEndpoint || !flipkartEndpoint) {
      throw new Error('AMAZON_API_ENDPOINT and FLIPKART_API_ENDPOINT are required in .env');
    }

    // Define all data sources
    this.sources = [
      {
        name: 'Amazon Products',
        url: amazonEndpoint,
        retailer: 'Amazon',
        limit: amazonLimit,
      },
      {
        name: 'Flipkart Products',
        url: flipkartEndpoint,
        retailer: 'Flipkart',
        limit: flipkartLimit,
      },
    ];
  }

  /**
   * Fetch products from a single Apify endpoint
   */
  async fetchFromEndpoint(source) {
    try {
      console.log(`  Fetching from: ${source.name}`);
      console.log(`  URL: ${source.url}`);
      console.log(`  Limit: ${source.limit} products`);

      const response = await axios.get(source.url, {
        params: {
          token: this.apiToken,
          format: 'json',
          limit: source.limit,
        },
        timeout: 60000, // 60 second timeout
      });

      const products = response.data || [];
      console.log(`  ✓ Fetched ${products.length} products from ${source.name}`);

      // Tag products with their source retailer
      return products.map(product => ({
        ...product,
        _sourceRetailer: source.retailer,
        _sourceName: source.name,
      }));

    } catch (error) {
      if (error.response) {
        console.error(`  ✗ API Error from ${source.name}:`, error.response.status, error.response.statusText);
        console.error(`  Response:`, error.response.data);
      } else if (error.request) {
        console.error(`  ✗ No response from ${source.name}:`, error.message);
      } else {
        console.error(`  ✗ Error with ${source.name}:`, error.message);
      }
      return []; // Return empty array on error, continue with other sources
    }
  }

  /**
   * Fetch latest scraped product data from all configured sources
   */
  async fetchAllProducts() {
    console.log('\n========================================');
    console.log('Fetching from all Apify sources...');
    console.log('========================================\n');

    const allProducts = [];

    for (const source of this.sources) {
      const products = await this.fetchFromEndpoint(source);
      allProducts.push(...products);
    }

    console.log(`\n✓ Total products fetched: ${allProducts.length}`);
    return allProducts;
  }
}

module.exports = ApifyClient;
