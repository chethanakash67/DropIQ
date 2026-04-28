require('dotenv').config();
const BrowseAiClient = require('./src/services/browseai-client');
const XLSX = require('xlsx');
const path = require('path');

async function fetchLastScrapeToExcel() {
  const client = new BrowseAiClient();
  
  try {
    console.log('========================================');
    console.log('Fetching Latest Browse.ai Scrape Results');
    console.log('========================================\n');

    // 1. Fetch data from the latest successful task
    const rawData = await client.fetchTaskData();
    
    // 2. Extract products from capturedLists
    let products = [];
    if (rawData) {
      // Find the first list in capturedLists
      const listNames = Object.keys(rawData);
      if (listNames.length > 0) {
        products = rawData[listNames[0]];
        console.log(`✓ Found ${products.length} products in list: "${listNames[0]}"`);
      } else {
        console.log('⚠️ No lists found in captured data.');
        return;
      }
    } else {
      console.log('⚠️ No data returned from Browse.ai.');
      return;
    }

    if (products.length === 0) {
      console.log('⚠️ No products found in the latest task.');
      return;
    }

    // 3. Create Workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(products);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Latest Scrape');

    // 4. Save to File
    const filename = `latest_scrape_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filepath = path.join(process.cwd(), filename);
    XLSX.writeFile(workbook, filepath);

    console.log('\n========================================');
    console.log('Export Complete!');
    console.log('========================================');
    console.log(`File: ${filename}`);
    console.log(`Location: ${filepath}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

fetchLastScrapeToExcel();
