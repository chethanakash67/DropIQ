const cron = require('node-cron');
const ingestApifyData = require('../jobs/ingest-apify-data');
const ingestAllStores = require('../jobs/ingest-all-stores');

/**
 * Monthly Data Ingestion Scheduler
 * 
 * Schedule: Runs on the 30th of every month at 1:00 AM IST
 * 
 * Cron Expression: '0 1 30 * *'
 * - Minute: 0 (at the start of the hour)
 * - Hour: 1 (1 AM)
 * - Day of Month: 30 (30th day)
 * - Month: * (every month)
 * - Day of Week: * (any day of the week)
 */

console.log('========================================');
console.log('Monthly Ingestion Scheduler Started');
console.log('========================================');
console.log('Schedule: 30th of every month at 1:00 AM IST');
console.log('Current time:', new Date().toLocaleString());
console.log('========================================\n');

async function runMonthlyIngestion() {
  console.log('\n========================================');
  console.log('Scheduled Monthly Ingestion Triggered');
  console.log('Time:', new Date().toLocaleString());
  console.log('========================================\n');

  try {
    // Step 1: Apify (Amazon + Flipkart)
    console.log('Step 1: Apify ingestion (Amazon + Flipkart)...');
    await ingestApifyData();
    console.log('✓ Apify ingestion completed');
  } catch (err) {
    console.error('✗ Apify ingestion failed:', err.message);
  }

  try {
    // Step 2: Browse.ai stores (Vijay Sales, Croma, TataCliq, Brands, Myntra, Headphones Zone)
    console.log('\nStep 2: Browse.ai store ingestion...');
    await ingestAllStores();
    console.log('✓ Browse.ai store ingestion completed');
  } catch (err) {
    console.error('✗ Browse.ai store ingestion failed:', err.message);
  }

  console.log('\n========================================');
  console.log('Monthly Ingestion Complete');
  console.log('========================================\n');
}

// Schedule the ingestion job to run monthly on the 30th at 1:00 AM IST
const monthlyJob = cron.schedule('0 1 30 * *', () => {
  runMonthlyIngestion().catch(err => {
    console.error('Fatal error in monthly ingestion:', err);
  });
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

process.on('SIGINT', () => {
  console.log('\n========================================');
  console.log('Stopping Monthly Ingestion Scheduler...');
  console.log('========================================');
  monthlyJob.stop();
  process.exit(0);
});

console.log('Scheduler is running. Press Ctrl+C to stop.\n');
console.log('Next scheduled run:');
console.log('- Date: 30th of current/next month');
console.log('- Time: 1:00 AM IST');
console.log('========================================\n');
