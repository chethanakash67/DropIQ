require('dotenv').config();
const axios = require('axios');
const db = require('../src/database/db');

async function test() {
    // Get a Myntra product ID
    const res = await db.query('SELECT id, product_name FROM myntra_products LIMIT 1');
    const id = res.rows[0].id;
    console.log(`Testing with Myntra product: ${res.rows[0].product_name} (${id})`);

    try {
        const response = await axios.get(`http://localhost:3001/api/products/${id}`);
        console.log('API Response (NO hint):', response.data.success ? 'Success' : 'Failed');
        if (response.data.success) {
            console.log('Retailer in response:', response.data.product.retailer_name);
        }
    } catch (err) {
        console.error('API Call failed:', err.message);
    }
}

test().finally(() => db.pool.end());
