const fs = require('fs');
const db = require('./src/database/db');
const path = require('path');

async function run() {
  const sqlPath = path.join(__dirname, 'src/database/migrations/011_create_myntra_products.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await db.query(sql);
  console.log('Successfully created Myntra products table!');
  process.exit(0);
}

run();
