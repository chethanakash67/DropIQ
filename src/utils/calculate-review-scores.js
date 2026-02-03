const db = require('../database/db');

/**
 * Calculate review score for a product
 * review_score = (rating/5) * min(log10(review_count+1)/3, 1)
 */
function calculateReviewScore(rating, reviewCount) {
    if (!rating || rating === 0) return 0;

    const ratingNorm = rating / 5;
    const confidence = Math.min(Math.log10((reviewCount || 0) + 1) / 3, 1);
    const reviewScore = ratingNorm * confidence;

    return Math.max(0, Math.min(1, reviewScore)); // Clamp between 0 and 1
}

/**
 * Update review scores for all products in all tables
 */
async function updateAllReviewScores() {
    try {
        console.log('🔄 Starting review score calculation...\n');

        const tables = ['amazon_products', 'flipkart_products', 'samsung_products', 'sony_products'];
        let totalUpdated = 0;

        for (const table of tables) {
            console.log(`Processing ${table}...`);

      // Get all products with ratings
      const query = `
        SELECT id, rating, reviews_count
        FROM ${table}
        WHERE rating IS NOT NULL AND rating > 0
      `;
      
      const result = await db.query(query);
      const products = result.rows;
      
      console.log(`  Found ${products.length} products with ratings`);
      
      // Update each product's review score
      for (const product of products) {
        const reviewScore = calculateReviewScore(product.rating, product.reviews_count || 0);
        
        await db.query(
          `UPDATE ${table} SET review_score = $1 WHERE id = $2`,
          [reviewScore, product.id]
        );
      }
      
      totalUpdated += products.length;
            console.log(`  ✅ Updated ${products.length} products\n`);
        }

        console.log(`\n✅ Total products updated: ${totalUpdated}`);
        return totalUpdated;

    } catch (error) {
        console.error('❌ Error updating review scores:', error);
        throw error;
    }
}

/**
 * Update brand scores based on brand names
 * Premium brands get higher scores
 */
async function updateBrandScores() {
    const brandScores = {
        // Premium brands
        'sony': 0.95,
        'samsung': 0.90,
        'apple': 1.00,
        'bose': 0.95,
        'sennheiser': 0.95,
        'jbl': 0.85,
        'marshall': 0.85,

        // Mid-tier brands
        'oneplus': 0.75,
        'realme': 0.70,
        'boat': 0.70,
        'noise': 0.65,
        'mi': 0.70,
        'xiaomi': 0.70,
        'redmi': 0.65,

        // Budget brands
        'ptron': 0.55,
        'boAt': 0.70,
        'default': 0.50
    };

    try {
        console.log('🔄 Updating brand scores...\n');

        const tables = ['amazon_products', 'flipkart_products', 'samsung_products', 'sony_products'];
        let totalUpdated = 0;

        for (const table of tables) {
            console.log(`Processing ${table}...`);

            for (const [brand, score] of Object.entries(brandScores)) {
                if (brand === 'default') continue;

                const result = await db.query(
                    `UPDATE ${table} 
           SET brand_score = $1 
           WHERE LOWER(brand) LIKE $2`,
                    [score, `%${brand.toLowerCase()}%`]
                );

                if (result.rowCount > 0) {
                    console.log(`  Updated ${result.rowCount} products for brand: ${brand}`);
                    totalUpdated += result.rowCount;
                }
            }

            console.log('');
        }

        console.log(`✅ Total brand scores updated: ${totalUpdated}\n`);
        return totalUpdated;

    } catch (error) {
        console.error('❌ Error updating brand scores:', error);
        throw error;
    }
}

// Run if executed directly
if (require.main === module) {
    (async () => {
        try {
            await updateAllReviewScores();
            await updateBrandScores();
            console.log('\n🎉 All scores calculated successfully!');
            process.exit(0);
        } catch (error) {
            console.error('Failed to calculate scores:', error);
            process.exit(1);
        }
    })();
}

module.exports = {
    calculateReviewScore,
    updateAllReviewScores,
    updateBrandScores
};
