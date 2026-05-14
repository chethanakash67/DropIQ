const express = require('express');
const ProductRepository = require('../repositories/product-repository');
const sovrnRecommendations = require('../services/sovrn-recommendations');
const sovrnPriceComparison = require('../services/sovrn-price-comparison');
const db = require('../database/db');
const { consumeCredits, InsufficientCreditsError } = require('../services/credits-service');
const { optionalAuth, authenticate } = require('../middleware/auth');

const router = express.Router();

const PRODUCT_TABLE_LABELS = {
  amazon_products: 'Amazon',
  flipkart_products: 'Flipkart',
  samsung_products: 'Samsung',
  sony_products: 'Sony',
  croma_products: 'Croma',
  vijay_sales_products: 'VijaySales',
  tatacliq_products: 'TataCliq',
  myntra_products: 'Myntra',
  oneplus_products: 'OnePlus',
  reliance_digital_products: 'Reliance Digital',
  boat_products: 'boAt',
  zebronics_products: 'Zebronics',
  headphones_zone_products: 'Headphones Zone',
};

const PRODUCT_TABLE_ALIASES = {
  zebronics_products: ['Zepronics', 'Zebronix', 'Zeb'],
};

function normalizeRetailerKey(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function displayNameFromProductTable(tableName) {
  if (PRODUCT_TABLE_LABELS[tableName]) return PRODUCT_TABLE_LABELS[tableName];

  return tableName
    .replace(/_products$/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function listProductTables() {
  const tablesResult = await db.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name LIKE '%_products'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  return tablesResult.rows
    .map(row => row.table_name)
    .filter(tableName => /^[a-z0-9_]+$/.test(tableName))
    .map(tableName => ({
      tableName,
      retailerName: displayNameFromProductTable(tableName),
      tableAlias: tableName.replace(/_products$/, ''),
      aliases: PRODUCT_TABLE_ALIASES[tableName] || [],
    }));
}

async function findProductTableForRetailer(retailer) {
  const requested = normalizeRetailerKey(retailer);
  const tables = await listProductTables();

  return tables.find(table =>
    normalizeRetailerKey(table.retailerName) === requested ||
    normalizeRetailerKey(table.tableAlias) === requested ||
    table.aliases.some(alias => normalizeRetailerKey(alias) === requested)
  );
}

/**
 * GET /api/products/search
 * Search products with filters
 * 
 * Query params:
 * - q: search term
 * - category: product category
 * - minPrice: minimum price
 * - maxPrice: maximum price
 * - retailer: retailer name (Amazon, Flipkart, etc.)
 * - sortBy: rating, price_asc, price_desc
 * - limit: results per page (default 50)
 * - offset: pagination offset (default 0)
 */
router.get('/search', optionalAuth, async (req, res) => {
  try {
    let updatedCreditState = null;
    const shouldChargeCredits = req.query.chargeCredits === 'true';
    const query = req.query.q || '';
    
    if (shouldChargeCredits && query) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please login to continue searching.',
        });
      }

      // Check if user already searched for this EXACT query in the last 60 seconds
      const alreadySearched = await ProductRepository.hasRecentSearch(req.user.id, query, 60);
      
      if (!alreadySearched) {
        updatedCreditState = await consumeCredits(req.user.id, 3);
      } else {
        console.log(`♻️ Skipping credit charge for recurring search (60s window): "${query}"`);
      }
    }

    const filters = {
      searchTerm: req.query.q || '',
      category: req.query.category,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      retailer: req.query.retailer,
      sortBy: req.query.sortBy || 'rating',
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    };

    const products = await ProductRepository.searchProducts(filters);

    // Save search query to history if user is logged in (non-blocking)
    if (filters.searchTerm && filters.searchTerm.trim().length > 0 && req.user) {
      ProductRepository.saveSearchQuery(req.user.id, filters.searchTerm).catch(err => {
        console.error('Failed to save search query:', err);
      });
    }

    res.json({
      success: true,
      count: products.length,
      filters: filters,
      products: products,
      credits: updatedCreditState?.credits ?? req.user?.credits,
      creditCost: shouldChargeCredits ? 3 : 0,
    });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return res.status(402).json({
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        message: 'Your credits are over. Please upgrade your plan.',
        requiredCredits: error.required,
        availableCredits: error.available,
        redirectTo: '/plans',
      });
    }
    console.error('Error in /api/products/search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search products',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/search-history
 * Get recent search history (User-specific, requires login)
 */
router.get('/search-history', authenticate, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 15;
    const history = await ProductRepository.getSearchHistory(req.user.id, limit);

    res.json({
      success: true,
      count: history.length,
      history: history,
    });
  } catch (error) {
    console.error('Error in /api/products/search-history:', error);
    res.status(500).json({
      success: false,
    });
  }
});

/**
 * DELETE /api/products/search-history
 * Clear all search history for a user
 */
router.delete('/search-history', authenticate, async (req, res) => {
  try {
    const success = await ProductRepository.clearSearchHistory(req.user.id);

    if (success) {
      res.json({
        success: true,
        message: 'Search history cleared successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to clear search history',
      });
    }
  } catch (error) {
    console.error('Error in DELETE /api/products/search-history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/popular-searches
 * Get most popular search queries
 */
router.get('/popular-searches', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const popular = await ProductRepository.getPopularSearches(limit);

    res.json({
      success: true,
      count: popular.length,
      searches: popular,
    });
  } catch (error) {
    console.error('Error in /api/products/popular-searches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular searches',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/products/search-history
 * Clear search history
 */
router.delete('/search-history', async (req, res) => {
  try {
    await ProductRepository.clearSearchHistory();

    res.json({
      success: true,
      message: 'Search history cleared',
    });
  } catch (error) {
    console.error('Error in DELETE /api/products/search-history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear search history',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/retailers
 * Get list of all available retailers
 */
router.get('/retailers', async (req, res) => {
  try {
    const productTables = await listProductTables();
    const retailers = [];

    for (const table of productTables) {
      try {
        const countResult = await db.query(`
          SELECT COUNT(*)::int AS count
          FROM ${table.tableName}
          WHERE is_deleted = FALSE
            AND availability_status = 'in_stock'
            AND product_name IS NOT NULL
            AND (price_inr IS NULL OR price_inr >= 1)
        `);

        const count = countResult.rows[0]?.count || 0;
        if (count > 0) {
          retailers.push({
            id: table.retailerName,
            name: table.retailerName,
            count,
          });
        }
      } catch (tableError) {
        console.warn(`Skipping retailer ${table.retailerName}:`, tableError.message);
      }
    }

    res.json({
      success: true,
      retailers: retailers
    });
  } catch (error) {
    console.error('Error in /api/products/retailers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch retailers',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/search-index
 * Returns a lightweight product index for client-side search.
 * Dynamically reads ALL *_products tables so it works for future stores too.
 * Each item contains: id, product_name, brand, category, price_inr, image_url, retailer_name, normalized_key
 */
router.get('/search-index', async (req, res) => {
  try {
    // Dynamically discover all product tables in the DB
    const tablesResult = await db.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE '%_products'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const allProducts = [];

    // Tables to exclude from search index
    const excludedTables = ['headphones_zone_products'];

    for (const row of tablesResult.rows) {
      const table = row.table_name;

      // Skip excluded tables
      if (excludedTables.includes(table)) {
        console.log(`Skipping excluded table: ${table}`);
        continue;
      }

      // Derive a human-readable store name from table name
      // e.g. amazon_products → Amazon, vijay_sales_products → Vijay Sales
      const storeName = table
        .replace(/_products$/, '')
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      try {
        const result = await db.query(`
          SELECT
            id,
            product_name,
            brand,
            category,
            price_inr,
            image_url,
            LOWER(REGEXP_REPLACE(product_name, '[^a-zA-Z0-9]', '', 'g')) AS normalized_key
          FROM ${table}
          WHERE is_deleted = FALSE
            AND product_name IS NOT NULL
            AND (price_inr IS NULL OR price_inr >= 1)
        `);
        result.rows.forEach(p => {
          allProducts.push({ ...p, retailer_name: storeName });
        });
      } catch (tableErr) {
        // Skip tables that don't have the expected columns (e.g. offline_stores)
        console.warn(`Skipping table ${table}:`, tableErr.message);
      }
    }

    res.json({ success: true, count: allProducts.length, products: allProducts });
  } catch (error) {
    console.error('Error in /api/products/search-index:', error);
    res.status(500).json({ success: false, error: 'Failed to build search index' });
  }
});

/**
 * GET /api/products/search-suggestions
 * Get dynamic search suggestions based on global history
 */
router.get('/search-suggestions', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const suggestions = await ProductRepository.getDynamicSuggestions(query, limit);

    res.json({
      success: true,
      suggestions: suggestions.map(s => s.search_query),
    });
  } catch (error) {
    console.error('Error in /api/products/search-suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/frequent-searches
 * Get frequently used search queries/keywords
 */
router.get('/frequent-searches', async (req, res) => {
  try {
    const searches = await ProductRepository.getFrequentSearches();

    res.json({
      success: true,
      searches: searches,
    });
  } catch (error) {
    console.error('Error in /api/products/frequent-searches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch frequent searches',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { retailer } = req.query;
    const db = require('../database/db');

    // Function to check a specific table
    const checkTable = async (tableName, retailerName) => {
      try {
        const result = await db.query(
          `SELECT *, $2 as retailer_name FROM ${tableName} WHERE id = $1`,
          [id, retailerName]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
      } catch (err) {
        return null;
      }
    };

    let product = null;

    // 1. If retailer hint provided, try that first
    if (retailer) {
      const productTable = await findProductTableForRetailer(retailer);
      if (productTable) {
        product = await checkTable(productTable.tableName, productTable.retailerName);
      } else {
        // Check if it's an offline store
        const offlineRes = await db.query(`
          SELECT s.table_name, s.store_name
          FROM offline_stores s
          JOIN information_schema.tables t
            ON t.table_schema = 'public'
           AND t.table_name = s.table_name
           AND t.table_type = 'BASE TABLE'
          WHERE (s.store_name = $1 OR s.store_id = $1)
            AND s.table_name ~ '^[a-z0-9_]+$'
        `, [retailer]);
        if (offlineRes.rows.length > 0) {
          product = await checkTable(offlineRes.rows[0].table_name, offlineRes.rows[0].store_name);
        }
      }
    }

    // 2. If not found or no hint, check all known tables
    if (!product) {
      const tables = await listProductTables();

      for (const t of tables) {
        product = await checkTable(t.tableName, t.retailerName);
        if (product) break;
      }
    }

    // 3. Last resort: check all offline stores
    if (!product) {
      const offlineStores = await db.query(`
        SELECT s.table_name, s.store_name
        FROM offline_stores s
        JOIN information_schema.tables t
          ON t.table_schema = 'public'
         AND t.table_name = s.table_name
         AND t.table_type = 'BASE TABLE'
        WHERE s.table_name ~ '^[a-z0-9_]+$'
      `);
      for (const store of offlineStores.rows) {
        product = await checkTable(store.table_name, store.store_name);
        if (product) break;
      }
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      product: product,
    });
  } catch (error) {
    console.error('Error in /api/products/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/:retailer/:id/recommendations
 * Get product recommendations (cached or fetch from Sovrn)
 * 
 * Path params:
 * - retailer: amazon, flipkart, samsung, sony
 * - id: product ID (UUID)
 */
router.get('/:retailer/:id/recommendations', async (req, res) => {
  try {
    const { retailer, id } = req.params;

    const productTable = await findProductTableForRetailer(retailer);
    if (!productTable) {
      return res.status(400).json({
        success: false,
        error: 'Invalid retailer'
      });
    }

    const tableName = productTable.tableName;

    // Fetch product with recommendations
    const productQuery = `
      SELECT id, product_name, brand, category, price_inr, description, 
             recommendations, product_url, affiliate_url
      FROM ${tableName}
      WHERE id = $1 AND is_deleted = FALSE
    `;

    const productResult = await db.query(productQuery, [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = productResult.rows[0];

    // Check if recommendations are cached
    if (product.recommendations && Array.isArray(product.recommendations) && product.recommendations.length > 0) {
      return res.json({
        success: true,
        product_id: id,
        product_name: product.product_name,
        recommendations: product.recommendations,
        cached: true
      });
    }

    // Fetch recommendations from Sovrn API
    console.log(`Fetching new recommendations for ${product.product_name}`);
    const recommendations = await sovrnRecommendations.getRecommendations(product, id);

    if (recommendations.length === 0) {
      return res.json({
        success: true,
        product_id: id,
        product_name: product.product_name,
        recommendations: [],
        message: 'No recommendations available'
      });
    }

    // Cache recommendations in database
    const updateQuery = `
      UPDATE ${tableName}
      SET recommendations = $1
      WHERE id = $2
    `;
    await db.query(updateQuery, [JSON.stringify(recommendations), id]);

    res.json({
      success: true,
      product_id: id,
      product_name: product.product_name,
      recommendations: recommendations,
      cached: false
    });

  } catch (error) {
    console.error('Error in /api/products/:retailer/:id/recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations',
      message: error.message
    });
  }
});

/**
 * GET /api/products/:retailer/:id/price-comparisons
 * Get price comparisons from different merchants for a product
 * 
 * Path params:
 * - retailer: amazon, flipkart, samsung, sony
 * - id: product ID (UUID)
 */
router.get('/:retailer/:id/price-comparisons', async (req, res) => {
  try {
    const { retailer, id } = req.params;

    const productTable = await findProductTableForRetailer(retailer);
    if (!productTable) {
      return res.status(400).json({
        success: false,
        error: 'Invalid retailer'
      });
    }

    const tableName = productTable.tableName;

    // Fetch product with price comparisons
    const productQuery = `
      SELECT id, product_name, brand, category, price_inr, 
             product_url, price_comparisons
      FROM ${tableName}
      WHERE id = $1 AND is_deleted = FALSE
    `;

    const productResult = await db.query(productQuery, [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = productResult.rows[0];

    // Check if price comparisons are cached
    if (product.price_comparisons && Array.isArray(product.price_comparisons) && product.price_comparisons.length > 0) {
      return res.json({
        success: true,
        product_id: id,
        product_name: product.product_name,
        comparisons: product.price_comparisons,
        cached: true
      });
    }

    // Fetch price comparisons from Sovrn API
    console.log(`Fetching price comparisons for ${product.product_name}`);
    const comparisons = await sovrnPriceComparison.getPriceComparisons(product, id);

    if (comparisons.length === 0) {
      return res.json({
        success: true,
        product_id: id,
        product_name: product.product_name,
        comparisons: [],
        message: 'No price comparisons available'
      });
    }

    // Cache price comparisons in database
    const updateQuery = `
      UPDATE ${tableName}
      SET price_comparisons = $1
      WHERE id = $2
    `;
    await db.query(updateQuery, [JSON.stringify(comparisons), id]);

    res.json({
      success: true,
      product_id: id,
      product_name: product.product_name,
      comparisons: comparisons,
      cached: false
    });

  } catch (error) {
    console.error('Error in /api/products/:retailer/:id/price-comparisons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price comparisons',
      message: error.message
    });
  }
});

module.exports = router;
