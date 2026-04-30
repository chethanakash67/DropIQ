const { Command } = require('commander');
const path = require('path');
const { exec } = require('child_process');

const program = new Command();

program
  .name('fetch-stores')
  .description('Manual fetch data from brand stores')
  .version('1.0.0')
  .option('-s, --stores <names>', 'Comma-separated store names (e.g. samsung,sony,all)', 'all')
  .option('-t, --task <id>', 'Specific Browse.ai Task ID (optional)')
  .action(async (options) => {
    const stores = options.stores.toLowerCase().split(',');
    const taskId = options.task;

    console.log('========================================');
    console.log('Manual Store Fetch Utility');
    console.log('========================================');
    console.log(`Target Stores: ${stores.join(', ')}`);
    if (taskId) console.log(`Specific Task ID: ${taskId}`);
    console.log('========================================\n');

    const runScript = (scriptName, arg = '') => {
      return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'jobs', scriptName);
        console.log(`🚀 Running ${scriptName}...`);
        
        const command = arg ? `node "${scriptPath}" "${arg}"` : `node "${scriptPath}"`;
        const child = exec(command);

        child.stdout.on('data', (data) => process.stdout.write(data));
        child.stderr.on('data', (data) => process.stderr.write(data));

        child.on('close', (code) => {
          if (code === 0) {
            console.log(`\n✓ ${scriptName} finished successfully.\n`);
            resolve();
          } else {
            console.error(`\n✗ ${scriptName} failed with code ${code}.\n`);
            reject(new Error(`${scriptName} failed`));
          }
        });
      });
    };

    try {
      if (stores.includes('samsung') || stores.includes('all')) {
        await runScript('ingest-samsung-data.js', taskId);
      }

      if (stores.includes('sony') || stores.includes('all')) {
        // Sony is currently handled by ingest-brand-stores.js
        // We'll run it, but it handles both Samsung and Sony internally
        await runScript('ingest-brand-stores.js');
      }

      console.log('========================================');
      console.log('All requested store fetches completed!');
      console.log('========================================');
    } catch (error) {
      console.error('\n✗ Error during manual fetch:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
