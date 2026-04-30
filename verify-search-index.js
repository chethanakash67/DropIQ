require('dotenv').config();
const db = require('./src/database/db');

async function run() {
    const r = await db.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name LIKE '%_products'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);
    console.log('Discovered product tables:');
    r.rows.forEach(x => console.log(' -', x.table_name));

    let total = 0;
    for (const row of r.rows) {
        try {
            const c = await db.query(`SELECT count(*) FROM ${row.table_name} WHERE is_deleted = FALSE`);
            total += parseInt(c.rows[0].count);
            console.log(`   ${row.table_name}: ${c.rows[0].count} rows`);
        } catch(e) {
            console.log(`   ${row.table_name}: skipped (${e.message})`);
        }
    }
    console.log('\nTotal indexable products:', total);
    await db.pool.end();
}
run();
