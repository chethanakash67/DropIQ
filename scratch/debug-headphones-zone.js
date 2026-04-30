require('dotenv').config();
const axios = require('axios');

async function debugRobot(robotId, apiKey, label) {
  console.log(`\n=== ${label} ===`);
  console.log(`Robot ID: ${robotId}`);
  const url = `https://api.browse.ai/v2/robots/${robotId}/tasks?limit=3`;
  
  try {
    const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const tasks = res.data.result?.robotTasks?.items || res.data.result?.items || [];
    console.log(`Found ${tasks.length} recent tasks.`);
    
    for (const t of tasks.slice(0, 2)) {
      console.log(`- Task ID: ${t.id}, Status: ${t.status}`);
      if (t.status === 'successful') {
        const detailUrl = `https://api.browse.ai/v2/robots/${robotId}/tasks/${t.id}`;
        const detailRes = await axios.get(detailUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        const capturedLists = detailRes.data.result.capturedLists;
        const capturedTexts = detailRes.data.result.capturedTexts;
        
        if (capturedLists && Object.keys(capturedLists).length > 0) {
          console.log(`  Captured Lists Keys: ${Object.keys(capturedLists)}`);
          Object.keys(capturedLists).forEach(key => {
            console.log(`  - List "${key}" has ${capturedLists[key].length} items.`);
            if (capturedLists[key].length > 0) {
              console.log(`    Example item:`, JSON.stringify(capturedLists[key][0], null, 2));
            }
          });
        }
        if (capturedTexts && Object.keys(capturedTexts).length > 0) {
          console.log(`  Captured Texts:`, JSON.stringify(capturedTexts, null, 2));
        }
        if ((!capturedLists || Object.keys(capturedLists).length === 0) && (!capturedTexts || Object.keys(capturedTexts).length === 0)) {
          console.log(`  No captured data found!`);
        }
      }
    }
  } catch (err) {
    console.error(`Error debugging robot ${robotId}:`, err.response?.data || err.message);
  }
}

async function run() {
  const apiKey = process.env.BROWSEAI_HEADPHONESZONE_API_KEY;
  const listRobotId = process.env.BROWSEAI_HEADPHONESZONE_LIST_ROBOT_ID;
  const detailRobotId = process.env.BROWSEAI_HEADPHONESZONE_DETAIL_ROBOT_ID;
  
  console.log('API Key:', apiKey);
  console.log('List Robot ID:', listRobotId);
  console.log('Detail Robot ID:', detailRobotId);
  
  if (listRobotId) await debugRobot(listRobotId, apiKey, 'Headphones Zone LIST Robot');
  if (detailRobotId) await debugRobot(detailRobotId, apiKey, 'Headphones Zone DETAIL Robot');
}

run();
