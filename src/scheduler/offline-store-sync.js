require('dotenv').config();
const cron = require('node-cron');
const { syncOfflineStores } = require('../jobs/sync-offline-stores');

/**
 * Scheduler for syncing offline store data from Google Sheets
 * Runs every 10 minutes to check for new store registrations
 */
class OfflineStoreScheduler {
  constructor() {
    this.syncTask = null;
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   * Runs every 10 minutes by default
   */
  start(cronExpression = '*/10 * * * *') {
    console.log('========================================');
    console.log('Offline Store Sync Scheduler Started');
    console.log(`Schedule: ${cronExpression} (every 10 minutes)`);
    console.log('========================================\n');

    // Run immediately on start
    this.runSync();

    // Schedule recurring syncs
    this.syncTask = cron.schedule(cronExpression, () => {
      this.runSync();
    });

    console.log('Scheduler is now running...\n');
  }

  /**
   * Run the sync job
   */
  async runSync() {
    if (this.isRunning) {
      console.log('⚠ Sync already in progress, skipping this run');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();

    try {
      console.log(`\n[${startTime.toISOString()}] Starting scheduled sync...`);
      await syncOfflineStores();
      const endTime = new Date();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`[${endTime.toISOString()}] Sync completed in ${duration}s\n`);
    } catch (error) {
      console.error('Scheduled sync failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.syncTask) {
      this.syncTask.stop();
      console.log('Offline Store Sync Scheduler stopped');
    }
  }
}

// Create singleton instance
const scheduler = new OfflineStoreScheduler();

// Run scheduler if called directly
if (require.main === module) {
  // Custom schedule can be provided via environment variable
  // Format: https://www.npmjs.com/package/node-cron
  // Default: '*/10 * * * *' (every 10 minutes)
  const schedule = process.env.OFFLINE_STORE_SYNC_SCHEDULE || '*/10 * * * *';
  
  scheduler.start(schedule);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, stopping scheduler...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, stopping scheduler...');
    scheduler.stop();
    process.exit(0);
  });
}

module.exports = scheduler;
