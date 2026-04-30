require('dotenv').config();
const axios = require('axios');

async function check() {
  const apiKey = process.env.BROWSEAI_MYNTRA_API_KEY || '1c87fb33-afb3-45aa-9731-f6b66f32415d:27e5d709-301c-477f-8019-0ff81badc8a7';
  const url = `https://api.browse.ai/v2/robots/019dd940-a482-76b0-8ce6-660657a001a4/tasks/019dd940-a54a-7094-a1b7-9aac63e76383`;
  
  try {
    const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const items = res.data.result.capturedLists['Earphones List'];
    items.forEach(item => {
        if (item['Product Name'].includes('Bassheads')) {
            console.log(`- ${item['Product Name']}: "${item['Discounted Price']}"`);
        }
    });
  } catch (err) {
    console.error(err.message);
  }
}

check();
