require('dotenv').config();
const axios = require('axios');

async function checkRobot() {
  const apiKey = process.env.BROWSEAI_VIJAYSALES_API_KEY;
  const robotId = '019dd547-a136-72b2-9e3a-9017dd664044';
  
  try {
    const url = `https://api.browse.ai/v2/robots/${robotId}`;
    const res = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    console.log("Robot input parameters:");
    console.log(res.data?.result?.inputParameters);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
checkRobot();
