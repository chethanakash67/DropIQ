require('dotenv').config();
const axios = require('axios');

async function debugRobot(robotId) {
  const apiKey = process.env.BROWSEAI_MYNTRA_API_KEY || '1c87fb33-afb3-45aa-9731-f6b66f32415d:27e5d709-301c-477f-8019-0ff81badc8a7';
  const url = `https://api.browse.ai/v2/robots/${robotId}/tasks?limit=5`;
  
  try {
    const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const tasks = res.data.result?.robotTasks?.items || res.data.result?.items || [];
    console.log(`\nRobot: ${robotId}`);
    console.log(`Found ${tasks.length} recent tasks.`);
    
    for (const task of tasks) {
      console.log(`- Task ID: ${task.id}, Status: ${task.status}`);
      if (task.status === 'successful') {
          const detailUrl = `https://api.browse.ai/v2/robots/${robotId}/tasks/${task.id}`;
          const detailRes = await axios.get(detailUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
          const capturedLists = detailRes.data.result.capturedLists;
          const capturedTexts = detailRes.data.result.capturedTexts;
          
          if (capturedLists) {
              console.log(`  Captured Lists Keys: ${Object.keys(capturedLists)}`);
              Object.keys(capturedLists).forEach(key => {
                  console.log(`  - List "${key}" has ${capturedLists[key].length} items.`);
                  if (capturedLists[key].length > 0) {
                      console.log(`    Example item:`, JSON.stringify(capturedLists[key][0], null, 2));
                  }
              });
          }
          if (capturedTexts) {
              console.log(`  Captured Texts:`, JSON.stringify(capturedTexts, null, 2));
          }
      }
    }
  } catch (err) {
    console.error(`Error debugging robot ${robotId}:`, err.response?.data || err.message);
  }
}

async function run() {
  console.log("Checking List Scraper Robot...");
  await debugRobot('019dd940-a482-76b0-8ce6-660657a001a4'); // List
  console.log("\nChecking Detail Scraper Robot...");
  await debugRobot('019dd945-0bb2-7ebf-a1be-72236e48acb7'); // Detail
}

run();
