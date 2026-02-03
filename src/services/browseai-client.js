const axios = require('axios');

/**
 * Browse.ai Client
 * 
 * Purpose: Fetch brand store product data from Browse.ai API
 * Docs: https://api.browse.ai/v2/robots
 */
class BrowseAiClient {
  constructor(apiKey, robotId, taskId) {
    this.apiKey = apiKey || process.env.BROWSEAI_API_KEY;
    this.robotId = robotId || process.env.BROWSEAI_SAMSUNG_ROBOT_ID;
    this.taskId = taskId || process.env.BROWSEAI_SAMSUNG_TASK_ID;
    this.baseUrl = process.env.BROWSEAI_API_BASE_URL || 'https://api.browse.ai/v2';

    if (!this.apiKey) {
      throw new Error('BROWSEAI_API_KEY is not configured in environment variables');
    }

    if (!this.robotId || !this.taskId) {
      throw new Error('BROWSEAI_ROBOT_ID and BROWSEAI_TASK_ID must be configured');
    }
  }

  /**
   * Fetch task data from Browse.ai
   * @returns {Promise<Array>} Array of captured product data
   */
  async fetchTaskData() {
    try {
      console.log('🤖 Fetching Samsung products from Browse.ai...');
      console.log(`Robot ID: ${this.robotId}`);
      console.log(`Task ID: ${this.taskId}`);

      const url = `${this.baseUrl}/robots/${this.robotId}/tasks/${this.taskId}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`Browse.ai API returned status ${response.status}`);
      }

      const data = response.data;

      // Extract captured data from response
      if (!data.result) {
        console.warn('⚠️ No result found in Browse.ai response');
        return [];
      }

      // Browse.ai can return data in various formats:
      // - capturedLists (for list data)
      // - capturedTexts (for single text fields)
      // - capturedScreenshots, etc.

      let products = [];

      if (data.result.capturedLists && Object.keys(data.result.capturedLists).length > 0) {
        console.log(`✓ Found capturedLists with ${Object.keys(data.result.capturedLists).length} lists`);
        products = data.result.capturedLists;
      } else if (data.result.capturedTexts && Object.keys(data.result.capturedTexts).length > 0) {
        console.log(`✓ Found capturedTexts with ${Object.keys(data.result.capturedTexts).length} fields`);
        // Return capturedTexts as single-element array for consistency
        products = [data.result.capturedTexts];
      } else {
        console.warn('⚠️ No capturedLists or capturedTexts found');
      }

      return products;

    } catch (error) {
      if (error.response) {
        console.error(`✗ Browse.ai API Error [${error.response.status}]:`, error.response.data);
      } else if (error.request) {
        console.error('✗ No response from Browse.ai API:', error.message);
      } else {
        console.error('✗ Browse.ai Client Error:', error.message);
      }
      throw error;
    }
  }

  /**
   * Get robot information
   * @returns {Promise<Object>} Robot details
   */
  async getRobotInfo() {
    try {
      const url = `${this.baseUrl}/robots/${this.robotId}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching robot info:', error.message);
      throw error;
    }
  }
}

module.exports = BrowseAiClient;
