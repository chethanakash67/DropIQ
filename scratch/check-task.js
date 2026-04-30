require('dotenv').config();
const axios = require('axios');

async function checkTask(robotId, taskId) {
  const apiKey = process.env.BROWSEAI_MYNTRA_API_KEY || '1c87fb33-afb3-45aa-9731-f6b66f32415d:27e5d709-301c-477f-8019-0ff81badc8a7';
  const url = `https://api.browse.ai/v2/robots/${robotId}/tasks/${taskId}`;
  
  try {
    const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const task = res.data.result;
    console.log(`Task ID: ${task.id}, Status: ${task.status}`);
    if (task.status === 'failed') {
        console.log('Failure Reason:', task.failureReason);
        console.log('Error Message:', task.errorMessage);
    }
  } catch (err) {
    console.error(`Error checking task ${taskId}:`, err.response?.data || err.message);
  }
}

checkTask('019dd945-0bb2-7ebf-a1be-72236e48acb7', '019dddc4-47e1-709e-8878-7c2ebe5491b7');
