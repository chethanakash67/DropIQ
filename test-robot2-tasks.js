require('dotenv').config();
const axios = require('axios');

async function checkTasks() {
  const apiKey = process.env.BROWSEAI_VIJAYSALES_API_KEY;
  const robotId = '019dd547-a136-72b2-9e3a-9017dd664044';
  
  try {
    const tasksUrl = `https://api.browse.ai/v2/robots/${robotId}/tasks?status=successful&limit=10`;
    const tasksRes = await axios.get(tasksUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const tasks = tasksRes.data?.result?.robotTasks?.items || tasksRes.data?.result?.items || [];
    console.log(`Found ${tasks.length} successful tasks.`);
    for (const task of tasks) {
      console.log(`- Task ID: ${task.id}, Type: ${task.type}`);
    }

    // Also check bulk runs
    const bulkUrl = `https://api.browse.ai/v2/robots/${robotId}/bulkRuns?limit=5`;
    const bulkRes = await axios.get(bulkUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const bulks = bulkRes.data?.result?.items || bulkRes.data?.result?.robotBulkRuns?.items || [];
    console.log(`Found ${bulks.length} bulk runs.`);
    for (const bulk of bulks) {
      console.log(`- Bulk ID: ${bulk.id}, Status: ${bulk.status}`);
    }

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

checkTasks();
