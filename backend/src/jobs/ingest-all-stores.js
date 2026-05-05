require('dotenv').config();
const ingestVijaySalesData = require('./ingest-vijay-sales-full');
const ingestCromaData = require('./ingest-croma-full');
const ingestTataCliqData = require('./ingest-tatacliq-full');
const ingestBrandStores = require('./ingest-brand-stores');
const ingestBrowseAiStores = require('./ingest-browseai-stores');

async function ingestAll(stores = []) {
    console.log('========================================');
    console.log('Global Store Ingestion Task');
    console.log('========================================\n');

    const allStores = {
        'vijay-sales': ingestVijaySalesData,
        'croma': ingestCromaData,
        'tatacliq': ingestTataCliqData,
        'brands': ingestBrandStores, // Handles Samsung and Sony
        'browseai-stores': ingestBrowseAiStores // Handles OnePlus, Reliance Digital, boAt
    };

    const targetStores = stores.length > 0 ? stores : Object.keys(allStores);

    for (const store of targetStores) {
        if (allStores[store]) {
            console.log(`\n🚀 Starting ingestion for: ${store}`);
            try {
                await allStores[store]();
                console.log(`✅ Completed: ${store}`);
            } catch (err) {
                console.error(`❌ Failed: ${store}`, err.message);
            }
        } else {
            console.log(`⚠️  Unknown store: ${store}. Skipping...`);
            console.log('Available stores: vijay-sales, croma, tatacliq, brands, browseai-stores');
        }
    }

    console.log('\n========================================');
    console.log('Global Ingestion Task Complete');
    console.log('========================================');
    process.exit(0);
}

// Only run if called directly (not when required as a module)
if (require.main === module) {
    const args = process.argv.slice(2);
    ingestAll(args);
}

module.exports = ingestAll;
