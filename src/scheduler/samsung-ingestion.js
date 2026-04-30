const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

/**
 * Samsung Store Data Ingestion Scheduler
 * 
 * Schedule: Runs on the 30th of every month at 4:00 AM (04:00)
 * 
 * Cron Expression: '0 4 30 * *'
 * - Minute: 0
 * - Hour: 4 (4 AM)
 * - Day of Month: 30 (30th day)
 * - Month: * (every month)
 * - Day of Week: * (any day of the week)
 */

console.log('========================================');
console.log('Samsung Ingestion Scheduler Started');
console.log('========================================');
console.log('Schedule: 30th of every month at 4:00 AM');
console.log('Current time:', new Date().toLocaleString());
console.log('========================================\n');

// Schedule the ingestion job
const samsungJob = cron.schedule('0 4 30 * *', () => {
  console.log('\n========================================');
  console.log('Scheduled Samsung Ingestion Triggered');
  console.log('Time:', new Date().toLocaleString());
  console.log('========================================\n');

  // Execute the ingestion script
  const ingestionScript = path.join(__dirname, '..', 'jobs', 'ingest-samsung-data.js');

  exec(`node "${ingestionScript}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('✗ Samsung Ingestion job failed:', error.message);
      console.error('Error details:', stderr);
      return;
    }

    console.log(stdout);

    if (stderr) {
      console.error('Warnings:', stderr);
    }

    console.log('✓ Samsung ingestion completed successfully');
  });
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Indian Standard Time (IST)
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n========================================');
  console.log('Stopping Samsung Ingestion Scheduler...');
  console.log('========================================');
  samsungJob.stop();
  process.exit(0);
});

console.log('Scheduler is running. Press Ctrl+C to stop.\n');
console.log('Next scheduled run:');
console.log('- Date: 30th of current/next month');
console.log('- Time: 4:00 AM IST');
console.log('========================================\n');
