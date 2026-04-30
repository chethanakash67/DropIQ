const axios = require('axios');

async function testMyntra() {
    try {
        const res = await axios.get('http://localhost:3001/api/products/search?q=t-shirt&limit=1');
        if (res.data.success && res.data.products.length > 0) {
            const product = res.data.products[0];
            console.log('Search Result:', {
                id: product.id,
                name: product.product_name,
                price_inr: product.price_inr,
                retailer: product.retailer_name
            });

            const detailRes = await axios.get(`http://localhost:3001/api/products/${product.id}?retailer=Myntra`);
            console.log('Detail Result:', {
                success: detailRes.data.success,
                price_inr: detailRes.data.product.price_inr,
                price: detailRes.data.product.price
            });
        } else {
            console.log('No Myntra products found in search.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testMyntra();
