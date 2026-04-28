require('dotenv').config();
const BrowseAiClient = require('./src/services/browseai-client');
const axios = require('axios');

async function testCromaTrigger() {
  const apiKey = process.env.BROWSEAI_CROMA_API_KEY || process.env.BROWSEAI_API_KEY; // not sure which api key it uses
  // Let's use the main API key or CROMA one
  
  // Actually, we'll just check .env
}
testCromaTrigger();
