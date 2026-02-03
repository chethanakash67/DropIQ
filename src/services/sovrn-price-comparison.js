const axios = require('axios');
const sovrnAffiliate = require('../utils/sovrn-affiliate');

const SOVRN_API_KEY = process.env.SOVRN_API_KEY;
const SOVRN_SECRET_KEY = process.env.SOVRN_SECRET_KEY;
const PRICE_COMPARISON_API_URL = 'https://comparisons.sovrn.com/api/affiliate/v3.5';
const USD_TO_INR = 83; // Conversion rate

/**
 * Get price comparisons for a product from different merchants
 * @param {Object} product - Product object with url, name, price
 * @param {number} productId - Product ID for tracking
 * @returns {Promise<Array>} Array of price comparison results
 */
async function getPriceComparisons(product, productId) {
  try {
    if (!SOVRN_SECRET_KEY) {
      throw new Error('SOVRN_SECRET_KEY not configured');
    }

    const market = 'usd_en'; // US market
    const limit = 10; // Top 10 merchants

    // Build API URL - use site API key in path
    const apiUrl = `${PRICE_COMPARISON_API_URL}/sites/${SOVRN_API_KEY}/compare/prices/${market}/by/accuracy`;

    // Prepare request parameters
    const params = {
      limit: limit,
      'epc-sort': true // Sort by EPC for best merchants
    };

    // Use search-keywords (product name) for better cross-merchant matching
    // plainlink only works for US URLs, but our products are from amazon.in/flipkart.com
    if (product.product_name) {
      // Clean product name for better search results
      const cleanName = product.product_name
        .replace(/\(.*?\)/g, '') // Remove parentheses content
        .replace(/\[.*?\]/g, '') // Remove brackets content
        .trim()
        .split(' ')
        .slice(0, 8) // Limit to first 8 words
        .join(' ');

      params['search-keywords'] = cleanName;
      console.log('Search keywords:', cleanName);
    } else {
      throw new Error('Product must have product_name');
    }

    // Add price range filter if product has price (±30% range)
    if (product.price_inr && !isNaN(product.price_inr)) {
      const priceUsd = product.price_inr / USD_TO_INR;
      const minPrice = Math.floor(priceUsd * 0.7); // -30%
      const maxPrice = Math.ceil(priceUsd * 1.3); // +30%
      params['price-range'] = `${minPrice}-${maxPrice}`;
    }

    console.log('🔍 Fetching price comparisons from Sovrn API...');
    console.log('API URL:', apiUrl);
    console.log('Params:', params);

    // Make API request with authorization header
    const response = await axios.get(apiUrl, {
      params: params,
      headers: {
        'Authorization': `secret ${SOVRN_SECRET_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Price comparison API response status:', response.status);

    // Parse response - API returns array directly
    let comparisons = [];
    if (Array.isArray(response.data)) {
      comparisons = response.data;
    } else if (response.data?.products && Array.isArray(response.data.products)) {
      comparisons = response.data.products;
    } else {
      console.warn('⚠️ Unexpected response format:', response.data);
      return [];
    }

    console.log(`📊 Found ${comparisons.length} merchant offers`);

    // Transform results to our format
    const transformedComparisons = comparisons.map(item => {
      // Extract price
      const priceUsd = item.salePrice || item.retailPrice || item.price || 0;
      const priceInr = Math.round(priceUsd * USD_TO_INR);

      // Get merchant name
      const merchant = item.merchant?.name || item.merchantName || item.seller || 'Unknown';

      // Get image URL
      const imageUrl = item.image || item.imageUrl || item.thumbnailUrl || item.thumbnail || '';

      // Get product name
      const name = item.name || item.title || item.productName || product.product_name;

      // Get product URL (use deeplink which already has affiliate tracking)
      const productUrl = item.deeplink || item.url || item.link || item.productUrl || '';

      // Use deeplink as affiliate URL since it's already tracked
      const affiliateUrl = productUrl;

      return {
        merchant: merchant,
        name: name,
        price_usd: priceUsd,
        price_inr: priceInr,
        image_url: imageUrl,
        product_url: productUrl,
        affiliate_url: affiliateUrl,
        availability: item.availability || (item.affiliatable ? 'in_stock' : 'unknown'),
        condition: item.condition || 'new',
        discount_rate: item.discountRate || 0,
        retail_price: item.retailPrice || priceUsd,
        epc: item.epc || 0
      };
    });

    // Sort by price (ascending - cheapest first)
    transformedComparisons.sort((a, b) => a.price_inr - b.price_inr);

    console.log('✅ Transformed price comparisons:', transformedComparisons.length);
    return transformedComparisons;

  } catch (error) {
    console.error('❌ Error fetching price comparisons:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

module.exports = {
  getPriceComparisons
};
