const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

/**
 * Monthly Data Ingestion Scheduler
 * 
 * Schedule: Runs on the 28th of every month at 11:00 PM (23:00)
 * 
 * Cron Expression: '0 23 28 * *'
 * - Minute: 0 (at the start of the hour)
 * - Hour: 23 (11 PM)
 * - Day of Month: 28 (28th day)
 * - Month: * (every month)
 * - Day of Week: * (any day of the week)
 */

console.log('========================================');
console.log('Monthly Ingestion Scheduler Started');
console.log('========================================');
console.log('Schedule: 28th of every month at 11:00 PM');
console.log('Current time:', new Date().toLocaleString());
console.log('========================================\n');

// Schedule the ingestion job to run monthly on the 28th at 11:00 PM
const monthlyJob = cron.schedule('0 23 28 * *', () => {
  console.log('\n========================================');
  console.log('Scheduled Monthly Ingestion Triggered');
  console.log('Time:', new Date().toLocaleString());
  console.log('========================================\n');

  // Execute the ingestion script
  const ingestionScript = path.join(__dirname, '..', 'jobs', 'ingest-apify-data.js');

  exec(`node "${ingestionScript}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('✗ Ingestion job failed:', error.message);
      console.error('Error details:', stderr);
      return;
    }

    console.log(stdout);

    if (stderr) {
      console.error('Warnings:', stderr);
    }

    console.log('✓ Monthly ingestion completed successfully');
  });
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Indian Standard Time (IST)
});

// Optional: Schedule for testing - runs every minute (comment out in production)
// const testJob = cron.schedule('* * * * *', () => {
//   console.log('Test run at:', new Date().toLocaleString());
// });

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n========================================');
  console.log('Stopping Monthly Ingestion Scheduler...');
  console.log('========================================');
  monthlyJob.stop();
  process.exit(0);
});

console.log('Scheduler is running. Press Ctrl+C to stop.\n');
console.log('Next scheduled run:');
console.log('- Date: 28th of current/next month');
console.log('- Time: 11:00 PM IST');
console.log('========================================\n');
