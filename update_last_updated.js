// Script to update last_updated for Amazon, Flipkart, Samsung, and other products
// Run this with node after configuring DB connection

const { Client } = require('pg');

const client = new Client({
  // Fill in your DB connection details here
  user: 'your_db_user',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

async function updateLastUpdated() {
  await client.connect();
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Amazon, Flipkart, Samsung: set to 30 days ago
  await client.query(`UPDATE amazon_products SET last_updated = $1`, [thirtyDaysAgo]);
  await client.query(`UPDATE flipkart_products SET last_updated = $1`, [thirtyDaysAgo]);
  await client.query(`UPDATE samsung_products SET last_updated = $1`, [thirtyDaysAgo]);

  // Other tables: set to 1 day ago (example: croma, sony, vijay_sales, etc.)
  await client.query(`UPDATE croma_products SET last_updated = $1`, [oneDayAgo]);
  await client.query(`UPDATE sony_products SET last_updated = $1`, [oneDayAgo]);
  await client.query(`UPDATE vijay_sales_products SET last_updated = $1`, [oneDayAgo]);

  console.log('last_updated fields updated.');
  await client.end();
}

updateLastUpdated().catch(console.error);
