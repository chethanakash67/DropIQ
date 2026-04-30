require('dotenv').config();
const axios = require('axios');

async function checkRobot(robotId) {
  const apiKey = process.env.BROWSEAI_MYNTRA_API_KEY || '1c87fb33-afb3-45aa-9731-f6b66f32415d:27e5d709-301c-477f-8019-0ff81badc8a7';
  const url = `https://api.browse.ai/v2/robots/${robotId}`;
  
  try {
    const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    console.log(`Robot ID: ${robotId}`);
    console.log(`Input Parameters:`, JSON.stringify(res.data.result.inputParameters, null, 2));
  } catch (err) {
    console.error(`Error checking robot ${robotId}:`, err.response?.data || err.message);
  }
}

checkRobot('019dd940-a482-76b0-8ce6-660657a001a4'); // List
checkRobot('019dd945-0bb2-7ebf-a1be-72236e48acb7'); // Detail
