require('dotenv').config();
const XLSX = require('xlsx');
const db = require('../database/db');
const path = require('path');

/**
 * Export PostgreSQL data to Excel
 * Creates separate sheets for Amazon and Flipkart products
 */

async function exportToExcel() {
  console.log('========================================');
  console.log('Exporting Database to Excel');
  console.log('========================================\n');

  try {
    // Fetch Amazon products
    console.log('Fetching Amazon products...');
    const amazonResult = await db.query(`
      SELECT 
        product_name,
        asin,
        category,
        price_inr,
        rating,
        reviews_count,
        description,
        image_url,
        product_url,
        affiliate_url,
        availability_status,
        created_at,
        last_updated
      FROM amazon_products
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `);
    console.log(`✓ Fetched ${amazonResult.rows.length} Amazon products`);

    // Fetch Flipkart products
    console.log('Fetching Flipkart products...');
    const flipkartResult = await db.query(`
      SELECT 
        product_name,
        product_id,
        category,
        price_inr,
        rating,
        reviews_count,
        description,
        image_url,
        product_url,
        affiliate_url,
        availability_status,
        created_at,
        last_updated
      FROM flipkart_products
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `);
    console.log(`✓ Fetched ${flipkartResult.rows.length} Flipkart products`);

    // Fetch Samsung products
    console.log('Fetching Samsung products...');
    const samsungResult = await db.query(`
      SELECT 
        product_name,
        brand,
        product_id,
        category,
        price_inr,
        rating,
        reviews_count,
        description,
        image_url,
        product_url,
        affiliate_url,
        availability_status,
        created_at,
        last_updated
      FROM samsung_products
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `);
    console.log(`✓ Fetched ${samsungResult.rows.length} Samsung products`);

    // Fetch Sony products
    console.log('Fetching Sony products...');
    const sonyResult = await db.query(`
      SELECT 
        product_name,
        brand,
        product_id,
        category,
        price_inr,
        rating,
        reviews_count,
        description,
        image_url,
        product_url,
        affiliate_url,
        availability_status,
        created_at,
        last_updated
      FROM sony_products
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `);
    console.log(`✓ Fetched ${sonyResult.rows.length} Sony products`);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add Amazon sheet
    if (amazonResult.rows.length > 0) {
      const amazonSheet = XLSX.utils.json_to_sheet(amazonResult.rows);
      XLSX.utils.book_append_sheet(workbook, amazonSheet, 'Amazon Products');
    }

    // Add Flipkart sheet
    if (flipkartResult.rows.length > 0) {
      const flipkartSheet = XLSX.utils.json_to_sheet(flipkartResult.rows);
      XLSX.utils.book_append_sheet(workbook, flipkartSheet, 'Flipkart Products');
    }

    // Add Samsung sheet
    if (samsungResult.rows.length > 0) {
      const samsungSheet = XLSX.utils.json_to_sheet(samsungResult.rows);
      XLSX.utils.book_append_sheet(workbook, samsungSheet, 'Samsung Products');
    }

    // Add Sony sheet
    if (sonyResult.rows.length > 0) {
      const sonySheet = XLSX.utils.json_to_sheet(sonyResult.rows);
      XLSX.utils.book_append_sheet(workbook, sonySheet, 'Sony Products');
    }

    // Add summary sheet
    const summary = [
      { Store: 'Amazon', 'Total Products': amazonResult.rows.length },
      { Store: 'Flipkart', 'Total Products': flipkartResult.rows.length },
      { Store: 'Samsung', 'Total Products': samsungResult.rows.length },
      { Store: 'Sony', 'Total Products': sonyResult.rows.length },
      { Store: 'TOTAL', 'Total Products': amazonResult.rows.length + flipkartResult.rows.length + samsungResult.rows.length + sonyResult.rows.length },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `products_export_${timestamp}.xlsx`;
    const filepath = path.join(process.cwd(), filename);

    // Write file
    XLSX.writeFile(workbook, filepath);

    console.log('\n========================================');
    console.log('Export Complete!');
    console.log('========================================');
    console.log(`File: ${filename}`);
    console.log(`Location: ${filepath}`);
    console.log(`\nSummary:`);
    console.log(`  Amazon Products: ${amazonResult.rows.length}`);
    console.log(`  Flipkart Products: ${flipkartResult.rows.length}`);
    console.log(`  Samsung Products: ${samsungResult.rows.length}`);
    console.log(`  Sony Products: ${sonyResult.rows.length}`);
    console.log(`  Total: ${amazonResult.rows.length + flipkartResult.rows.length + samsungResult.rows.length + sonyResult.rows.length}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  } finally {
    await db.pool.end();
  }
}

// Run export if called directly
if (require.main === module) {
  exportToExcel()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = exportToExcel;
