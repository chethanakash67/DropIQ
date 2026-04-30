const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let content = fs.readFileSync(envPath, 'utf8');

// Replace old endpoints with new actor IDs
content = content.replace(
  /AMAZON_API_ENDPOINT=.*/,
  'AMAZON_ACTOR_ID=BG3WDrGdteHgZgbPK'
);
content = content.replace(
  /FLIPKART_API_ENDPOINT=.*/,
  'FLIPKART_ACTOR_ID=b1eFX3WpDTmd1PezM'
);

fs.writeFileSync(envPath, content, 'utf8');
console.log('.env updated successfully');
