const repo = require('./src/repositories/product-repository');

async function testSearch() {
  console.log('=== Testing Enhanced Search ===\n');

  const tests = [
    { q: 'sony earbuds', desc: 'Should find Sony products' },
    { q: 'samsung headphones', desc: 'Should find Samsung Galaxy products' },
    { q: 'galaxy buds', desc: 'Should find Samsung Galaxy Buds' },
    { q: 'wireless earbuds', desc: 'Should find wireless earbuds' },
    { q: 'apple airpods', desc: 'Should find Apple AirPods' },
    { q: 'wired earphones', desc: 'Should find wired earphones' },
    { q: 'jbl headphones', desc: 'Should find JBL headphones' }
  ];

  for (const test of tests) {
    const results = await repo.searchProducts({ searchTerm: test.q, limit: 5 });
    console.log(`Query: "${test.q}"`);
    console.log(test.desc);
    console.log(`Found: ${results.length} products`);

    if (results.length > 0) {
      results.slice(0, 3).forEach(p => {
        const name = p.product_name.length > 55 ? p.product_name.substring(0, 55) + '...' : p.product_name;
        console.log(`  ✓ ${p.brand} - ${name}`);
      });
    } else {
      console.log('  ✗ No results found');
    }
    console.log('');
  }

  process.exit(0);
}

testSearch().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
