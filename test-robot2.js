require('dotenv').config();
const BrowseAiClient = require('./src/services/browseai-client');

async function testFetch() {
  const apiKey = process.env.BROWSEAI_VIJAYSALES_API_KEY;
  const robotId = '019dd547-a136-72b2-9e3a-9017dd664044';
  const taskId = '019dd547-a1d0-7f79-80cf-dddd1bf4ecfa';

  const client = new BrowseAiClient(apiKey, robotId, taskId);
  try {
    const rawData = await client.fetchTaskData();
    console.log('Raw Data Length/Keys:', Array.isArray(rawData) ? rawData.length : Object.keys(rawData));
    console.log('Sample Data:');
    if (Array.isArray(rawData)) {
      console.log(JSON.stringify(rawData[0], null, 2));
    } else {
      const firstKey = Object.keys(rawData)[0];
      console.log(JSON.stringify(rawData[firstKey].slice(0, 1), null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

testFetch();
