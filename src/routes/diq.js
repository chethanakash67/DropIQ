const express = require('express');
const router = express.Router();
const diqQuestions = require('../config/diq-questions');
const { getQuestionsForCategory } = require('../config/diq-questions');
const diqScoringService = require('../services/diq-scoring-service');

/**
 * GET /api/diq/questions
 * Get all D_IQ questionnaire questions
 */
router.get('/questions', (req, res) => {
  try {
    res.json({
      success: true,
      questions: diqQuestions,
      totalQuestions: diqQuestions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

/**
 * GET /api/diq/questions/:category
 * Get questions for a specific category
 */
router.get('/questions/:category', (req, res) => {
  try {
    const { category } = req.params;

    // Get category-specific questions
    const categoryQuestions = getQuestionsForCategory(category);

    res.json({
      success: true,
      category,
      questions: categoryQuestions,
      totalQuestions: categoryQuestions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions',
      details: error.message
    });
  }
});

/**
 * POST /api/diq/recommendations
 * Get personalized product recommendations based on answers
 * 
 * Body:
 * {
 *   "answers": {
 *     "q1_primary_use": { selectedOption },
 *     "q2_budget": { selectedOption },
 *     ...
 *   },
 *   "limit": 10,
 *   "searchQuery": "earbuds",
 *   "category": "earbuds"
 * }
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { answers, limit = 10, searchQuery = '', category = '' } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Answers are required'
      });
    }

    // Get top products based on D_IQ scoring
    const topProducts = await diqScoringService.getTopProducts(
      answers,
      parseInt(limit),
      searchQuery,
      category
    );

    res.json({
      success: true,
      count: topProducts.length,
      products: topProducts,
      message: topProducts.length === 0
        ? 'No products match your preferences. Try adjusting your filters.'
        : `Found ${topProducts.length} products matching your preferences`
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      details: error.message
    });
  }
});

/**
 * POST /api/diq/calculate-scores
 * Calculate D_IQ scores for all products based on answers
 * Returns full ranked list (not limited to top 10)
 */
router.post('/calculate-scores', async (req, res) => {
  try {
    const { answers, searchQuery = '', category = '' } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Answers are required'
      });
    }

    // Get all ranked products
    const rankedProducts = await diqScoringService.rankProducts(
      answers,
      searchQuery,
      category
    );

    // Group by rating
    const groupedByRating = {
      excellent: rankedProducts.filter(p => p.diq_rating === 'Excellent'),
      good: rankedProducts.filter(p => p.diq_rating === 'Good'),
      fair: rankedProducts.filter(p => p.diq_rating === 'Fair'),
      poor: rankedProducts.filter(p => p.diq_rating === 'Poor')
    };

    res.json({
      success: true,
      totalProducts: rankedProducts.length,
      products: rankedProducts,
      groupedByRating: {
        excellent: groupedByRating.excellent.length,
        good: groupedByRating.good.length,
        fair: groupedByRating.fair.length,
        poor: groupedByRating.poor.length
      },
      topProducts: rankedProducts.slice(0, 10)
    });
  } catch (error) {
    console.error('Error calculating scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate scores',
      details: error.message
    });
  }
});

/**
 * GET /api/diq/test
 * Test endpoint with sample answers
 */
router.get('/test', async (req, res) => {
  try {
    // Sample answers for testing
    const sampleAnswers = {
      q1_primary_use: diqQuestions[0].options[1], // Travel
      q2_budget: diqQuestions[1].options[1],       // 3-7k
      q3_call_quality: diqQuestions[2].options[1], // Important
      q4_noise_cancellation: diqQuestions[3].options[1], // Preferred
      q5_battery_life: diqQuestions[4].options[0], // 24+ hours
      q6_brand_preference: diqQuestions[5].options[3], // No preference
      q7_color_preference: diqQuestions[6].options[3], // No preference
      q8_design_style: diqQuestions[7].options[3]  // No preference
    };

    const topProducts = await diqScoringService.getTopProducts(sampleAnswers, 5);

    res.json({
      success: true,
      message: 'Test with sample answers (Travel use case, 3-7k budget, prefers ANC & long battery)',
      sampleAnswers: Object.keys(sampleAnswers).map(key => ({
        question: sampleAnswers[key].text,
        description: sampleAnswers[key].description
      })),
      topProducts: topProducts.map(p => ({
        name: p.product_name.substring(0, 60),
        price: `₹${p.price_inr}`,
        diq_score: p.diq_score,
        diq_rating: p.diq_rating,
        has_anc: p.has_anc,
        battery_hours: p.battery_hours,
        retailer: p.retailer
      }))
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
});

module.exports = router;
