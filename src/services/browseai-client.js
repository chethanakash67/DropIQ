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

    if (!this.robotId) {
      throw new Error('BROWSEAI_SAMSUNG_ROBOT_ID must be configured');
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
      
      let effectiveTaskId = this.taskId;

      // If no taskId is provided, fetch the latest successful task
      if (!effectiveTaskId) {
        console.log('No Task ID provided, fetching latest successful task...');
        const tasksUrl = `${this.baseUrl}/robots/${this.robotId}/tasks?status=successful&limit=1`;
        const tasksRes = await axios.get(tasksUrl, {
          headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
        });
        
        const tasks = tasksRes.data?.result?.robotTasks?.items || tasksRes.data?.result?.items;
        
        if (tasks && tasks.length > 0) {
          effectiveTaskId = tasks[0].id;
          console.log(`✓ Found latest Task ID: ${effectiveTaskId}`);
        } else {
          throw new Error('No successful tasks found for this robot');
        }
      }

      console.log(`Using Task ID: ${effectiveTaskId}`);
      const url = `${this.baseUrl}/robots/${this.robotId}/tasks/${effectiveTaskId}`;

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

  /**
   * Trigger a new robot run (task)
   * @param {Object} inputParameters Optional parameters for the robot
   * @returns {Promise<Object>} The created task details
   */
  async runRobot(inputParameters = {}) {
    try {
      console.log('🚀 Triggering fresh Browse.ai run...');
      const url = `${this.baseUrl}/robots/${this.robotId}/tasks`;
      
      const response = await axios.post(url, {
        inputParameters
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✓ Task triggered! New Task ID: ${response.data.result.id}`);
      return response.data.result;
    } catch (error) {
      console.error('✗ Browse.ai Trigger Error:', error.response?.data?.message || error.message);
      throw error;
    }
  }
}

module.exports = BrowseAiClient;
