require('dotenv').config();
const BrowseAiClient = require('./src/services/browseai-client');
const ingestSamsungData = require('./src/jobs/ingest-samsung-data');
const exportToExcel = require('./src/utils/export-to-excel');
const axios = require('axios');

async function triggerAndFetch() {
  const client = new BrowseAiClient();
  
  try {
    console.log('========================================');
    console.log('Fresh Browse.ai Data Fetch');
    console.log('========================================\n');

    // 1. Trigger fresh run
    const newTask = await client.runRobot();
    const taskId = newTask.id;
    
    console.log(`\n⏳ Waiting for task ${taskId} to complete...`);
    console.log('This usually takes 1-3 minutes. Please wait.');

    // 2. Poll for completion
    let status = 'pending';
    let attempts = 0;
    const maxAttempts = 20; // 10 minutes max (30s intervals)
    
    while (status !== 'successful' && status !== 'failed' && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      
      const res = await axios.get(`${client.baseUrl}/robots/${client.robotId}/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${client.apiKey}` }
      });
      
      status = res.data.result.status;
      console.log(`[${new Date().toLocaleTimeString()}] Current Status: ${status}`);
      
      if (status === 'failed') {
        throw new Error('Browse.ai task failed.');
      }
    }

    if (status !== 'successful') {
      throw new Error('Task timed out or failed.');
    }

    console.log('\n✅ Task completed successfully!');

    // 3. Ingest data
    console.log('\n📦 Starting data ingestion...');
    // We pass the taskId to ensure we ingest the fresh data we just generated
    // Note: I'll update ingestSamsungData to accept a taskId if it doesn't already
    await ingestSamsungData(taskId);

    // 4. Export to Excel
    console.log('\n📊 Exporting results to Excel...');
    await exportToExcel();

    console.log('\n========================================');
    console.log('Fresh Data Fetch & Export Complete!');
    console.log('========================================');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

triggerAndFetch();
