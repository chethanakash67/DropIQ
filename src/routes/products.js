const express = require('express');
const ProductRepository = require('../repositories/product-repository');
const sovrnRecommendations = require('../services/sovrn-recommendations');
const sovrnPriceComparison = require('../services/sovrn-price-comparison');
const db = require('../database/db');

const router = express.Router();

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
router.get('/search', async (req, res) => {
  try {
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

    // Save search query to history (non-blocking)
    if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
      ProductRepository.saveSearchQuery(filters.searchTerm).catch(err => {
        console.error('Failed to save search query:', err);
      });
    }

    res.json({
      success: true,
      count: products.length,
      filters: filters,
      products: products,
    });
  } catch (error) {
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
 * Get recent search history
 */
router.get('/search-history', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const history = await ProductRepository.getSearchHistory(limit);

    res.json({
      success: true,
      count: history.length,
      history: history,
    });
  } catch (error) {
    console.error('Error in /api/products/search-history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch search history',
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
    const db = require('../database/db');

    // Try Amazon first
    let result = await db.query(
      `SELECT *, 'Amazon' as retailer_name FROM amazon_products WHERE id = $1`,
      [id]
    );

    // If not found, try Flipkart
    if (result.rows.length === 0) {
      result = await db.query(
        `SELECT *, 'Flipkart' as retailer_name FROM flipkart_products WHERE id = $1`,
        [id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      product: result.rows[0],
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

    // Validate retailer
    const validRetailers = ['amazon', 'flipkart', 'samsung', 'sony'];
    if (!validRetailers.includes(retailer.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid retailer. Must be: amazon, flipkart, samsung, or sony'
      });
    }

    const tableName = `${retailer.toLowerCase()}_products`;

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

    // Validate retailer
    const validRetailers = ['amazon', 'flipkart', 'samsung', 'sony'];
    if (!validRetailers.includes(retailer.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid retailer. Must be: amazon, flipkart, samsung, or sony'
      });
    }

    const tableName = `${retailer.toLowerCase()}_products`;

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
