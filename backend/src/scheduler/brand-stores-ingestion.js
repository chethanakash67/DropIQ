const cron = require('node-cron');
const ingestBrowseAiStores = require('../jobs/ingest-browseai-stores');

/**
 * Brand Stores Data Ingestion Scheduler
 * 
 * Schedule: Runs on the 1st of every month at 2:00 AM IST
 * Handles: Zebronics, boAt, Reliance Digital, OnePlus
 * 
 * Cron Expression: '0 2 1 * *'
 */

console.log('========================================');
console.log('Brand Stores Ingestion Scheduler Started');
console.log('========================================');
console.log('Schedule: 1st of every month at 2:00 AM IST');
console.log('Current time:', new Date().toLocaleString());
console.log('========================================\n');

async function runBrandStoresIngestion() {
  console.log('\n========================================');
  console.log('Scheduled Brand Stores Ingestion Triggered');
  console.log('Time:', new Date().toLocaleString());
  console.log('========================================\n');

  try {
    const brands = ['ZEBRONICS', 'BOAT', 'RELIANCE_DIGITAL', 'ONEPLUS'];
    console.log(`Starting ingestion for brands: ${brands.join(', ')}...`);
    
    await ingestBrowseAiStores(brands);
    
    console.log('✓ Brand stores ingestion completed successfully');
  } catch (err) {
    console.error('✗ Brand stores ingestion failed:', err.message);
  }

  console.log('\n========================================');
  console.log('Brand Stores Ingestion Complete');
  console.log('========================================\n');
}

// Schedule the ingestion job
const brandJob = cron.schedule('0 2 1 * *', () => {
  runBrandStoresIngestion().catch(err => {
    console.error('Fatal error in brand stores ingestion:', err);
  });
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

process.on('SIGINT', () => {
  console.log('\n========================================');
  console.log('Stopping Brand Stores Ingestion Scheduler...');
  console.log('========================================');
  brandJob.stop();
  process.exit(0);
});

console.log('Scheduler is running. Next run on the 1st of the month at 2:00 AM IST.\n');
