require('dotenv').config();
const { pool } = require('./src/database/db');
const fs = require('fs');
const path = require('path');

async function exportLinks() {
  const client = await pool.connect();
  try {
    console.log('Fetching all product links from database...');
    
    // Query to get all unique product URLs from all 4 tables
    const query = `
      SELECT product_url FROM amazon_products WHERE product_url IS NOT NULL
      UNION
      SELECT product_url FROM flipkart_products WHERE product_url IS NOT NULL
      UNION
      SELECT product_url FROM samsung_products WHERE product_url IS NOT NULL
      UNION
      SELECT product_url FROM sony_products WHERE product_url IS NOT NULL
    `;

    const res = await client.query(query);
    const links = res.rows.map(row => row.product_url);

    console.log(`Found ${links.length} unique product links.`);

    // Prepare CSV content (single column with header)
    const csvContent = ['product_link', ...links].join('\n');
    
    const filePath = path.join(__dirname, 'product_links.csv');
    fs.writeFileSync(filePath, csvContent);

    console.log(`✓ CSV file created successfully: ${filePath}`);
    console.log(`Total rows: ${links.length + 1}`);

  } catch (error) {
    console.error('✗ Export failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

exportLinks();
