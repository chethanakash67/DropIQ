require('dotenv').config();
const axios = require('axios');

async function checkBulk() {
  const apiKey = process.env.BROWSEAI_VIJAYSALES_API_KEY;
  const robotId = '019dd547-a136-72b2-9e3a-9017dd664044'; // detail robot
  
  try {
    const bulkUrl = `https://api.browse.ai/v2/robots/${robotId}/bulk-runs?limit=5`;
    const bulkRes = await axios.get(bulkUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    console.log("Bulk runs GET success:", bulkRes.data);
  } catch (err) {
    console.error("Bulk runs GET error:", err.response?.data || err.message);
  }
}
checkBulk();
