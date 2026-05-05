require('dotenv').config();
const XLSX = require('xlsx');
const db = require('../database/db');
const path = require('path');
const { Command } = require('commander');

/**
 * Export a specific PostgreSQL table to Excel
 */

async function exportTableToExcel(tableName, filename) {
  console.log('========================================');
  console.log(`Exporting Table: ${tableName}`);
  console.log('========================================\n');

  try {
    // Check if table exists
    const checkTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `, [tableName]);

    if (!checkTable.rows[0].exists) {
      console.error(`Error: Table "${tableName}" does not exist.`);
      return;
    }

    // Fetch data
    console.log(`Fetching data from ${tableName}...`);
    const result = await db.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
    console.log(`✓ Fetched ${result.rows.length} rows`);

    if (result.rows.length === 0) {
      console.log('No data to export.');
      return;
    }

    // Process data to stringify objects/arrays for Excel
    const processedRows = result.rows.map(row => {
      const newRow = { ...row };
      for (const key in newRow) {
        if (newRow[key] !== null && typeof newRow[key] === 'object') {
          newRow[key] = JSON.stringify(newRow[key]);
        }
      }
      return newRow;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(processedRows);
    XLSX.utils.book_append_sheet(workbook, sheet, tableName.substring(0, 31));

    // Generate filename if not provided
    const finalFilename = filename || `${tableName}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filepath = path.join(process.cwd(), finalFilename);

    // Write file
    XLSX.writeFile(workbook, filepath);

    console.log('\n========================================');
    console.log('Export Complete!');
    console.log('========================================');
    console.log(`File: ${finalFilename}`);
    console.log(`Location: ${filepath}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Export failed:', error.message);
    throw error;
  } finally {
    await db.pool.end();
  }
}

// CLI setup
if (require.main === module) {
  const program = new Command();
  program
    .version('1.0.0')
    .arguments('[tableName]')
    .option('-t, --table <name>', 'Table name to export')
    .option('-f, --file <name>', 'Output filename')
    .action((tableName, options) => {
      const table = options.table || tableName;
      if (!table) {
        console.error('error: required argument "tableName" or option "-t, --table <name>" not specified');
        process.exit(1);
      }
      exportTableToExcel(table, options.file)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
    });

  program.parse(process.argv);
}

module.exports = exportTableToExcel;
