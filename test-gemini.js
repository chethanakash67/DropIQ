require('dotenv').config();
const geminiService = require('./src/services/gemini-service');

async function testGemini() {
  console.log('Testing Gemini Service...\n');

  const testQueries = [
    'soony headfons',
    'sumsung erbods',
    'aple airpods',
    'samsung earbuds' // correct one
  ];

  for (const query of testQueries) {
    console.log(`\n--- Testing: "${query}" ---`);
    console.log(`Has likely mistakes: ${geminiService.hasLikelyMistakes(query)}`);

    try {
      const result = await geminiService.correctSpelling(query);
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testGemini().catch(console.error);
