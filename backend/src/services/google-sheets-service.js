const { google } = require('googleapis');
const path = require('path');

class GoogleSheetsService {
  constructor() {
    // Load service account credentials
    const keyFilePath = path.join(__dirname, '../../gen-lang-client-0169377687-30900ec04eb4.json');
    
    this.auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Fetch data from a Google Sheet
   * @param {string} spreadsheetId - The ID of the spreadsheet
   * @param {string} range - The A1 notation of the range to fetch (e.g., 'Sheet1!A1:Z1000')
   * @returns {Promise<Array>} Array of row data
   */
  async fetchSheetData(spreadsheetId, range = 'Sheet1') {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      
      if (!rows || rows.length === 0) {
        console.log('No data found in the sheet.');
        return [];
      }

      // Convert rows to objects using first row as headers
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      return data;
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw error;
    }
  }

  /**
   * Watch for changes in the spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet
   * @returns {Promise<Object>} Metadata about the spreadsheet
   */
  async getSpreadsheetMetadata(spreadsheetId) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });
      
      return {
        title: response.data.properties.title,
        sheets: response.data.sheets.map(sheet => ({
          title: sheet.properties.title,
          sheetId: sheet.properties.sheetId,
          rowCount: sheet.properties.gridProperties.rowCount,
          columnCount: sheet.properties.gridProperties.columnCount,
        }))
      };
    } catch (error) {
      console.error('Error fetching spreadsheet metadata:', error);
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();
