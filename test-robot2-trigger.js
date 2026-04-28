require('dotenv').config();
const BrowseAiClient = require('./src/services/browseai-client');
const axios = require('axios');

async function testTask() {
  const apiKey = process.env.BROWSEAI_VIJAYSALES_API_KEY;
  const robotId = '019dd547-a136-72b2-9e3a-9017dd664044';
  
  const client = new BrowseAiClient(apiKey, robotId);
  try {
    const task = await client.runRobot({
      "OriginUrl": "https://www.vijaysales.com/apple-earpods-usb-c-white/26251"
    });
    console.log("Task triggered:", task.id);
    
    // Poll for completion
    let status = task.status;
    let data;
    while (status !== 'successful' && status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const url = `https://api.browse.ai/v2/robots/${robotId}/tasks/${task.id}`;
      const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
      status = res.data.result.status;
      data = res.data;
      console.log("Status:", status);
    }
    
    if (status === 'successful') {
      console.log("Result:", data.result.capturedTexts);
    }
  } catch (err) {
    console.error(err);
  }
}
testTask();
