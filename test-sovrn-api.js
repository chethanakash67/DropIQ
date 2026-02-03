require('dotenv').config();
const axios = require('axios');

async function testSovrnAPI() {
  const apiKey = process.env.SOVRN_API_KEY;
  console.log('API Key:', apiKey);
  console.log('');

  const requestBody = {
    title: "Wireless Earbuds",
    content: "Wireless earbuds with bluetooth connectivity, long battery life, and noise cancellation"
  };

  console.log('Request Body:', JSON.stringify(requestBody, null, 2));
  console.log('');

  try {
    const response = await axios({
      method: 'POST',
      url: `https://shopping-gallery.prd-commerce.sovrnservices.com/ai-orchestration/products`,
      params: {
        apiKey: apiKey,
        pageUrl: 'https://dropiq01.vercel.app/products/earbuds',
        numProducts: 5,
        market: 'usd_en'
      },
      data: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✓ SUCCESS! Status:', response.status);
    console.log('Found', response.data.length, 'products');
    console.log('\nFull response structure (first product):');
    console.log(JSON.stringify(response.data[0], null, 2));
  } catch (error) {
    if (error.response) {
      console.error('✗ Error Status:', error.response.status);
      console.error('✗ Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('✗ Error:', error.message);
    }
  }
}

testSovrnAPI();
