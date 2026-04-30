require('dotenv').config();
const BrowseAiClient = require('./src/services/browseai-client');

async function checkApi(store) {
    let apiKey, robotId, taskId;

    if (store === 'vijay-sales') {
        apiKey = process.env.BROWSEAI_VIJAYSALES_API_KEY;
        robotId = process.env.BROWSEAI_VIJAYSALES_ROBOT_ID;
        taskId = process.env.BROWSEAI_VIJAYSALES_TASK_ID;
    } else if (store === 'croma') {
        apiKey = process.env.BROWSEAI_CROMA_API_KEY;
        robotId = process.env.BROWSEAI_CROMA_ROBOT_ID;
        taskId = process.env.BROWSEAI_CROMA_TASK_ID;
    } else {
        console.error('Usage: node check-api.js [vijay-sales|croma]');
        process.exit(1);
    }

    console.log(`\n🔍 Checking Browse.ai API for: ${store}`);
    console.log(`Robot ID: ${robotId}`);
    console.log(`Task ID: ${taskId || 'Last finished task'}`);

    const client = new BrowseAiClient(apiKey, robotId, taskId);

    try {
        console.log('Fetching data...');
        const rawData = await client.fetchTaskData();

        if (!rawData) {
            console.error('❌ No data returned from API.');
            return;
        }

        let products = [];
        if (Array.isArray(rawData)) {
            products = rawData;
        } else if (typeof rawData === 'object') {
            const listNames = Object.keys(rawData);
            console.log(`Detected lists: ${listNames.join(', ')}`);
            if (listNames.length > 0) {
                products = rawData[listNames[0]];
            }
        }

        console.log(`\n✅ Successfully fetched ${products.length} items.`);
        
        if (products.length > 0) {
            console.log('\n--- SINGLE RESULT PREVIEW ---');
            console.log(JSON.stringify(products[0], null, 2));
            console.log('-----------------------------\n');
        } else {
            console.log('⚠️  The list is empty.');
        }

    } catch (err) {
        console.error('❌ API Error:', err.message);
        if (err.response) {
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
        }
    }
}

const store = process.argv[2] || 'vijay-sales';
checkApi(store);
