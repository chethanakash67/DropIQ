/**
 * Sovrn Commerce Affiliate Link Generator
 * Wraps product URLs with Sovrn affiliate tracking
 */

class SovrnAffiliate {
  constructor() {
    this.apiKey = process.env.SOVRN_API_KEY;
    this.bidFloor = parseFloat(process.env.SOVRN_BID_FLOOR || '0.10');
    this.baseUrl = 'https://sovrn.co';
  }

  /**
   * Generate Sovrn affiliate link with bid floor and fallback URL
   * @param {string} destinationUrl - Original product URL
   * @param {object} options - Optional tracking parameters
   * @returns {string} Sovrn wrapped affiliate URL
   */
  generateAffiliateLink(destinationUrl, options = {}) {
    if (!this.apiKey) {
      console.warn('SOVRN_API_KEY not configured, returning original URL');
      return destinationUrl;
    }

    if (!destinationUrl || destinationUrl.trim() === '') {
      return destinationUrl;
    }

    try {
      // URL-encode the destination URL
      const encodedDestination = encodeURIComponent(destinationUrl);

      // URL-encode the fallback URL (same as destination)
      const encodedFallback = encodeURIComponent(destinationUrl);

      // Build affiliate URL with required params + bid floor + fallback
      let affiliateUrl = `${this.baseUrl}?key=${this.apiKey}&u=${encodedDestination}`;

      // Add bid floor
      affiliateUrl += `&bf=${this.bidFloor}`;

      // Add fallback URL (original product URL)
      affiliateUrl += `&fbu=${encodedFallback}`;

      // Add optional tracking parameters
      if (options.cuid) {
        affiliateUrl += `&cuid=${encodeURIComponent(options.cuid)}`;
      }
      if (options.utm_source) {
        affiliateUrl += `&utm_source=${encodeURIComponent(options.utm_source)}`;
      }
      if (options.utm_medium) {
        affiliateUrl += `&utm_medium=${encodeURIComponent(options.utm_medium)}`;
      }
      if (options.utm_campaign) {
        affiliateUrl += `&utm_campaign=${encodeURIComponent(options.utm_campaign)}`;
      }

      return affiliateUrl;
    } catch (error) {
      console.error('Error generating Sovrn affiliate link:', error.message);
      return destinationUrl; // Fallback to original URL on error
    }
  }

  /**
   * Batch generate affiliate links for multiple products
   * @param {Array} products - Array of product objects with product_url field
   * @param {string} retailer - Retailer name for tracking
   * @returns {Array} Products with affiliate_url field added
   */
  generateBatchAffiliateLinks(products, retailer = 'unknown') {
    return products.map(product => {
      const affiliateUrl = this.generateAffiliateLink(
        product.product_url,
        {
          cuid: `${retailer}_${product.product_id || 'unknown'}`,
          utm_source: 'dropiq_search',
          utm_medium: 'product_listing',
          utm_campaign: retailer.toLowerCase()
        }
      );

      return {
        ...product,
        affiliate_url: affiliateUrl
      };
    });
  }
}

module.exports = new SovrnAffiliate();
