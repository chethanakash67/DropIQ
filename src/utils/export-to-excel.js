require('dotenv').config();
const XLSX = require('xlsx');
const db = require('../database/db');
const path = require('path');

/**
 * Export PostgreSQL data to Excel
 * Creates separate sheets for all database tables
 */

async function exportToExcel() {
  console.log('========================================');
  console.log('Exporting COMPLETE Database to Excel');
  console.log('========================================\n');

  try {
    // 1. Get all table names in the public schema
    const tablesQuery = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const tableNames = tablesQuery.rows.map(r => r.table_name);
    console.log(`Found ${tableNames.length} tables in the database.\n`);

    const workbook = XLSX.utils.book_new();
    const summary = [];
    let totalRecords = 0;

    // 2. Loop through each table and fetch all records
    for (const tableName of tableNames) {
      console.log(`Fetching data from [${tableName}]...`);
      
      try {
        const result = await db.query(`SELECT * FROM "${tableName}"`);
        const records = result.rows;
        console.log(`✓ Fetched ${records.length} records`);

        summary.push({
          Table: tableName,
          'Total Records': records.length
        });
        totalRecords += records.length;

        if (records.length > 0) {
          // Process JSON/Object fields for Excel stringification
          const processedRows = records.map(row => {
            const newRow = { ...row };
            for (const key in newRow) {
              if (newRow[key] !== null && typeof newRow[key] === 'object') {
                newRow[key] = JSON.stringify(newRow[key]);
              }
            }
            return newRow;
          });

          // Create sheet and append to workbook
          // Sheet names must be <= 31 chars
          const sheetName = tableName.substring(0, 31);
          const sheet = XLSX.utils.json_to_sheet(processedRows);
          XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
        }
      } catch (err) {
        console.error(`✗ Error fetching table ${tableName}:`, err.message);
      }
    }

    // 3. Add Summary sheet
    summary.push({ Table: 'TOTAL', 'Total Records': totalRecords });
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // 4. Generate filename and save
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `complete_db_export_${timestamp}.xlsx`;
    const filepath = path.join(process.cwd(), filename);

    XLSX.writeFile(workbook, filepath);

    console.log('\n========================================');
    console.log('Export Complete!');
    console.log('========================================');
    console.log(`File: ${filename}`);
    console.log(`Location: ${filepath}`);
    console.log(`\nExported ${totalRecords} total records across ${tableNames.length} tables.`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Fatal Export Error:', error);
    throw error;
  } finally {
    await db.pool.end();
  }
}

// Run export if called directly
if (require.main === module) {
  exportToExcel()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = exportToExcel;
