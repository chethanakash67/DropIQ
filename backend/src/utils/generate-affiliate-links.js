require('dotenv').config();

// Ensure environment variables are loaded BEFORE requiring sovrn-affiliate
if (!process.env.SOVRN_API_KEY) {
  process.env.SOVRN_API_KEY = '0727a1b0f44aef88d463a65bda2696c7';
  process.env.SOVRN_BID_FLOOR = '0.10';
}

const db = require('../database/db');
const sovrnAffiliate = require('./sovrn-affiliate');

/**
 * Generate affiliate links for all existing products
 */
async function generateAffiliateLinks() {
  console.log('========================================');
  console.log('Generating Affiliate Links');
  console.log('========================================\n');

  try {
    let totalUpdated = 0;

    // Update Amazon products
    console.log('Processing Amazon products...');
    const amazonProducts = await db.query(
      'SELECT id, asin, product_url FROM amazon_products WHERE product_url IS NOT NULL'
    );

    for (const product of amazonProducts.rows) {
      const affiliateUrl = sovrnAffiliate.generateAffiliateLink(product.product_url, {
        cuid: `amazon_${product.asin}`,
        utm_campaign: 'amazon'
      });

      await db.query(
        'UPDATE amazon_products SET affiliate_url = $1 WHERE id = $2',
        [affiliateUrl, product.id]
      );
    }
    console.log(`✓ Updated ${amazonProducts.rows.length} Amazon products`);
    totalUpdated += amazonProducts.rows.length;

    // Update Flipkart products
    console.log('Processing Flipkart products...');
    const flipkartProducts = await db.query(
      'SELECT id, product_id, product_url FROM flipkart_products WHERE product_url IS NOT NULL'
    );

    for (const product of flipkartProducts.rows) {
      const affiliateUrl = sovrnAffiliate.generateAffiliateLink(product.product_url, {
        cuid: `flipkart_${product.product_id}`,
        utm_campaign: 'flipkart'
      });

      await db.query(
        'UPDATE flipkart_products SET affiliate_url = $1 WHERE id = $2',
        [affiliateUrl, product.id]
      );
    }
    console.log(`✓ Updated ${flipkartProducts.rows.length} Flipkart products`);
    totalUpdated += flipkartProducts.rows.length;

    // Update Samsung products
    console.log('Processing Samsung products...');
    const samsungProducts = await db.query(
      'SELECT id, product_id, product_url FROM samsung_products WHERE product_url IS NOT NULL'
    );

    for (const product of samsungProducts.rows) {
      const affiliateUrl = sovrnAffiliate.generateAffiliateLink(product.product_url, {
        cuid: `samsung_${product.product_id || 'unknown'}`,
        utm_campaign: 'samsung'
      });

      await db.query(
        'UPDATE samsung_products SET affiliate_url = $1 WHERE id = $2',
        [affiliateUrl, product.id]
      );
    }
    console.log(`✓ Updated ${samsungProducts.rows.length} Samsung products`);
    totalUpdated += samsungProducts.rows.length;

    // Update Sony products
    console.log('Processing Sony products...');
    const sonyProducts = await db.query(
      'SELECT id, product_id, product_url FROM sony_products WHERE product_url IS NOT NULL'
    );

    for (const product of sonyProducts.rows) {
      const affiliateUrl = sovrnAffiliate.generateAffiliateLink(product.product_url, {
        cuid: `sony_${product.product_id || 'unknown'}`,
        utm_campaign: 'sony'
      });

      await db.query(
        'UPDATE sony_products SET affiliate_url = $1 WHERE id = $2',
        [affiliateUrl, product.id]
      );
    }
    console.log(`✓ Updated ${sonyProducts.rows.length} Sony products`);
    totalUpdated += sonyProducts.rows.length;

    console.log('\n========================================');
    console.log('Affiliate Links Generation Complete!');
    console.log(`Total products updated: ${totalUpdated}`);
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

generateAffiliateLinks();
