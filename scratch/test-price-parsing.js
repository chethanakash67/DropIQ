const priceRaw = "Rs. 349";
const price = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));
console.log(`Raw: "${priceRaw}"`);
console.log(`Replaced: "${priceRaw.replace(/[^0-9.]/g, '')}"`);
console.log(`Parsed: ${price}`);

const priceRaw2 = "Rs. 1,499";
const price2 = parseFloat(priceRaw2.replace(/[^0-9.]/g, ''));
console.log(`Raw: "${priceRaw2}"`);
console.log(`Replaced: "${priceRaw2.replace(/[^0-9.]/g, '')}"`);
console.log(`Parsed: ${price2}`);
