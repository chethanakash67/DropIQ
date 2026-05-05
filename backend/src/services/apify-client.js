require('dotenv').config();
const axios = require('axios');

class ApifyClient {
  constructor() {
    this.apiToken = process.env.APIFY_API_TOKEN;
    this.lastFetchFailures = [];

    if (!this.apiToken) {
      throw new Error('APIFY_API_TOKEN is required in .env');
    }

    const amazonEndpoint = process.env.AMAZON_API_ENDPOINT;
    const flipkartEndpoint = process.env.FLIPKART_API_ENDPOINT;
    const amazonActorId = process.env.AMAZON_ACTOR_ID;
    const flipkartActorId = process.env.FLIPKART_ACTOR_ID;
    const amazonLimit = parseInt(process.env.AMAZON_PRODUCT_LIMIT || '500');
    const flipkartLimit = parseInt(process.env.FLIPKART_PRODUCT_LIMIT || '450');

    if ((!amazonEndpoint && !amazonActorId) || (!flipkartEndpoint && !flipkartActorId)) {
      throw new Error('AMAZON_API_ENDPOINT/FLIPKART_API_ENDPOINT or AMAZON_ACTOR_ID/FLIPKART_ACTOR_ID are required in .env');
    }

    this.sources = [
      {
        name: 'Amazon Products',
        endpoint: amazonEndpoint,
        actorId: amazonActorId,
        retailer: 'Amazon',
        limit: amazonLimit,
      },
      {
        name: 'Flipkart Products',
        endpoint: flipkartEndpoint,
        actorId: flipkartActorId,
        retailer: 'Flipkart',
        limit: flipkartLimit,
      },
    ];
  }

  /**
   * Resolve the last successful run for an actor and return its dataset items
   */
  async fetchFromEndpoint(source) {
    const response = await axios.get(source.endpoint, {
      params: {
        token: this.apiToken,
        format: 'json',
        limit: source.limit,
        status: 'SUCCEEDED',
      },
      timeout: 30000,
    });

    let products = [];
    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (Array.isArray(response.data?.items)) {
      products = response.data.items;
    } else {
      throw new Error(`Unexpected response shape from ${source.name}`);
    }

    console.log(`  ✓ Fetched ${products.length} products from ${source.name}`);

    return products.map(product => ({
      ...product,
      _sourceRetailer: source.retailer,
      _sourceName: source.name,
    }));
  }

  async resolveActorIdFromEndpoint(endpoint) {
    try {
      const url = new URL(endpoint);
      const parts = url.pathname.split('/').filter(Boolean);

      const actsIndex = parts.indexOf('acts');
      if (actsIndex !== -1 && parts[actsIndex + 1]) {
        const actorIdentifier = decodeURIComponent(parts[actsIndex + 1]);
        const response = await axios.get(`https://api.apify.com/v2/acts/${actorIdentifier}`, {
          params: {
            token: this.apiToken,
          },
          timeout: 30000,
        });

        return response.data?.data?.id || actorIdentifier;
      }

      const taskIndex = parts.indexOf('actor-tasks');
      if (taskIndex === -1 || !parts[taskIndex + 1]) {
        return null;
      }

      const taskIdentifier = decodeURIComponent(parts[taskIndex + 1]);
      const taskName = taskIdentifier.includes('~') ? taskIdentifier.split('~').pop() : taskIdentifier;

      const response = await axios.get('https://api.apify.com/v2/actor-tasks', {
        params: {
          token: this.apiToken,
          limit: 1000,
        },
        timeout: 30000,
      });

      const tasks = response.data?.data?.items || [];
      const task = tasks.find(item =>
        item.id === taskIdentifier ||
        item.id === taskName ||
        item.name === taskIdentifier ||
        item.name === taskName
      );

      return task?.actId || null;
    } catch (error) {
      return null;
    }
  }

  async fetchFromActorRuns(source) {
    console.log(`  Actor ID: ${source.actorId}`);

    // Step 1: Get the last successful run for this actor
    const runsUrl = 'https://api.apify.com/v2/actor-runs';
    const runsRes = await axios.get(runsUrl, {
      params: {
        token: this.apiToken,
        actorId: source.actorId,
        status: 'SUCCEEDED',
        limit: 10,
        desc: true,
      },
      timeout: 30000,
    });

    const runs = runsRes.data?.data?.items || [];
    // Filter to ensure we only get runs from THIS actor (API may return runs from all actors)
    const actorRuns = runs.filter(r => r.actId === source.actorId);
    if (actorRuns.length === 0) {
      console.warn(`  ⚠ No successful runs found for actor ${source.actorId}`);
      return [];
    }

    const lastRun = actorRuns[0];
    const datasetId = lastRun.defaultDatasetId;
    console.log(`  ✓ Last successful run: ${lastRun.id} (started: ${lastRun.startedAt})`);
    console.log(`  Dataset ID: ${datasetId}`);

    // Step 2: Fetch items from the dataset
    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items`;
    const response = await axios.get(datasetUrl, {
      params: {
        token: this.apiToken,
        format: 'json',
        limit: source.limit,
      },
      timeout: 120000,
    });

    let products = [];
    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (Array.isArray(response.data?.items)) {
      products = response.data.items;
    } else {
      throw new Error(`Unexpected response shape from ${source.name}`);
    }

    console.log(`  ✓ Fetched ${products.length} products from ${source.name}`);

    return products.map(product => ({
      ...product,
      _sourceRetailer: source.retailer,
      _sourceName: source.name,
    }));
  }

  async fetchFromSource(source) {
    try {
      console.log(`  Fetching from: ${source.name}`);
      if (source.endpoint) {
        console.log('  Source: configured API endpoint');
      } else {
        console.log(`  Actor ID: ${source.actorId}`);
      }
      console.log(`  Limit: ${source.limit} products`);

      if (source.endpoint) {
        try {
          return await this.fetchFromEndpoint(source);
        } catch (endpointError) {
          const fallbackActorId = source.actorId || await this.resolveActorIdFromEndpoint(source.endpoint);
          if (!fallbackActorId) {
            throw endpointError;
          }

          console.warn(`  ⚠ Endpoint fetch failed (${endpointError.response?.status || endpointError.message}); trying latest actor run instead`);
          return await this.fetchFromActorRuns({
            ...source,
            actorId: fallbackActorId,
          });
        }
      }

      return await this.fetchFromActorRuns(source);

    } catch (error) {
      this.lastFetchFailures.push({
        source: source.name,
        message: error.message,
      });

      if (error.response) {
        console.error(`  ✗ API Error from ${source.name}:`, error.response.status, error.response.statusText);
      } else if (error.request) {
        console.error(`  ✗ No response from ${source.name}:`, error.message);
      } else {
        console.error(`  ✗ Error with ${source.name}:`, error.message);
      }
      return [];
    }
  }

  /**
   * Fetch latest scraped product data from all configured sources
   */
  async fetchAllProducts() {
    console.log('\n========================================');
    console.log('Fetching from all Apify sources...');
    console.log('========================================\n');

    const allProducts = [];

    for (const source of this.sources) {
      const products = await this.fetchFromSource(source);
      allProducts.push(...products);
    }

    console.log(`\n✓ Total products fetched: ${allProducts.length}`);

    if (allProducts.length === 0 && this.lastFetchFailures.length === this.sources.length) {
      const failures = this.lastFetchFailures.map(failure => `${failure.source}: ${failure.message}`).join('; ');
      throw new Error(`Failed to fetch products from all Apify sources. ${failures}`);
    }

    return allProducts;
  }
}

module.exports = ApifyClient;
