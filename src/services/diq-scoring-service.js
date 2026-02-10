const db = require('../database/db');
const categoryMedians = require('../config/category-medians.json');

/**
 * D_IQ Scoring Service
 * Calculates personalized product scores based on user preferences
 */

class DIQScoringService {
  /**
   * Calculate feature score for a product based on user preferences
   * @param {Object} product - Product with features
   * @param {Object} weights - Feature weights from user answers
   * @returns {Number} Feature score (0-1)
   */
  calculateFeatureScore(product, weights) {
    // Base feature weights (from D_IQ formula)
    const baseWeights = {
      anc: 0.30,
      battery: 0.20,
      fastCharge: 0.15,
      micQuality: 0.25,
      appSupport: 0.10
    };

    // Feature values (normalized 0-1)
    const features = {
      anc: product.has_anc ? 1 : 0,
      battery: this.normalizeBattery(product.battery_hours || 0),
      fastCharge: product.has_fast_charge ? 1 : 0,
      micQuality: parseFloat(product.mic_quality_score) || 0.5,
      appSupport: product.has_app_support ? 1 : 0
    };

    // Apply user preference weights
    const weightedFeatures = {
      anc: features.anc * baseWeights.anc * (weights.anc_weight || 1.0),
      battery: features.battery * baseWeights.battery * (weights.battery_weight || 1.0),
      fastCharge: features.fastCharge * baseWeights.fastCharge * (weights.fast_charge_weight || 1.0),
      micQuality: features.micQuality * baseWeights.micQuality * (weights.mic_quality_weight || 1.0),
      appSupport: features.appSupport * baseWeights.appSupport * (weights.app_support_weight || 1.0)
    };

    // Calculate total weighted score
    const totalWeight = 
      baseWeights.anc * (weights.anc_weight || 1.0) +
      baseWeights.battery * (weights.battery_weight || 1.0) +
      baseWeights.fastCharge * (weights.fast_charge_weight || 1.0) +
      baseWeights.micQuality * (weights.mic_quality_weight || 1.0) +
      baseWeights.appSupport * (weights.app_support_weight || 1.0);

    const featureScore = (
      weightedFeatures.anc +
      weightedFeatures.battery +
      weightedFeatures.fastCharge +
      weightedFeatures.micQuality +
      weightedFeatures.appSupport
    ) / totalWeight;

    return Math.max(0, Math.min(1, featureScore));
  }

  /**
   * Normalize battery hours to 0-1 scale
   * 0 hours = 0, 24+ hours = 1
   */
  normalizeBattery(hours) {
    if (hours >= 24) return 1;
    if (hours <= 0) return 0;
    return hours / 24;
  }

  /**
   * Calculate value score
   * value_score = 0.45*feature_score + 0.35*review_score + 0.20*brand_score
   */
  calculateValueScore(featureScore, reviewScore, brandScore) {
    return (
      0.45 * featureScore +
      0.35 * (parseFloat(reviewScore) || 0) +
      0.20 * (parseFloat(brandScore) || 0.5)
    );
  }

  /**
   * Calculate D_IQ Score (Price-Value Ratio)
   * diq_score = value_score / (price / category_median_price)
   */
  calculateDIQScore(valueScore, price, categoryMedian) {
    if (!price || price <= 0) return 0;
    if (!categoryMedian || categoryMedian <= 0) return 0;

    const normalizedPrice = price / categoryMedian;
    const diqScore = valueScore / normalizedPrice;

    return diqScore;
  }

  /**
   * Get D_IQ rating based on score
   */
  getDIQRating(score) {
    if (score >= 1.2) return 'Excellent';
    if (score >= 1.0) return 'Good';
    if (score >= 0.8) return 'Fair';
    return 'Poor';
  }

  /**
   * Map user answers to feature weights
   * @param {Object} answers - User's answers to questions
   * @returns {Object} Compiled weights and filters
   */
  mapAnswersToWeights(answers) {
    const weights = {
      anc_weight: 1.0,
      battery_weight: 1.0,
      fast_charge_weight: 1.0,
      mic_quality_weight: 1.0,
      app_support_weight: 1.0,
      brand_weight: 1.0,
      value_weight: 1.0,
      quality_weight: 1.0,
      // Additional weights for new categories
      comfort_weight: 1.0,
      audio_quality_weight: 1.0,
      durability_weight: 1.0,
      latency_weight: 1.0,
      convenience_weight: 1.0,
      versatility_weight: 1.0,
      wired_weight: 1.0,
      wireless_weight: 1.0,
      cable_quality_weight: 1.0,
      fit_weight: 1.0,
      passive_isolation_weight: 1.0,
      driver_size_weight: 1.0,
      impedance_weight: 1.0,
      compatibility_weight: 1.0,
      bass_weight: 1.0,
      balance_weight: 1.0,
      clarity_weight: 1.0,
      treble_weight: 1.0,
      inline_controls_weight: 1.0
    };

    const filters = {
      anc_required: false,
      wireless_required: null, // null = no preference, true = wireless, false = wired
      battery_min_hours: 0,
      price_range: { min: 0, max: 999999 },
      brand_filter: null,
      color_filter: null,
      design_filter: null,
      connector_type: null, // For wired earphones
      fast_charge_required: false,
      category: '' // Store selected category
    };

    // Extract category from q0_category if present
    if (answers.q0_category && answers.q0_category.id) {
      filters.category = answers.q0_category.id;
    }

    // Process each answer
    Object.keys(answers).forEach(questionId => {
      const selectedOption = answers[questionId];
      if (selectedOption && selectedOption.scoring) {
        // Merge weights (multiply for cumulative effect)
        Object.keys(selectedOption.scoring).forEach(key => {
          if (key.includes('_weight')) {
            weights[key] = (weights[key] || 1.0) * selectedOption.scoring[key];
          } else {
            // Merge filters
            filters[key] = selectedOption.scoring[key];
          }
        });

        // Handle price range
        if (selectedOption.priceRange) {
          filters.price_range = selectedOption.priceRange;
        }

        // Handle filters property
        if (selectedOption.filters) {
          Object.keys(selectedOption.filters).forEach(filterKey => {
            filters[filterKey] = selectedOption.filters[filterKey];
          });
        }
      }
    });

    return { weights, filters };
  }

  /**
   * Apply filters to products
   */
  applyFilters(products, filters) {
    return products.filter(product => {
      // Price filter
      const price = parseFloat(product.price_inr) || 0;
      if (price < filters.price_range.min || price > filters.price_range.max) {
        return false;
      }

      // ANC filter (hard requirement)
      if (filters.anc_required && !product.has_anc) {
        return false;
      }

      // Fast charge filter (hard requirement)
      if (filters.fast_charge_required && !product.has_fast_charge) {
        return false;
      }

      // Battery filter (minimum hours)
      if (filters.battery_min_hours > 0) {
        const battery = product.battery_hours || 0;
        if (battery < filters.battery_min_hours) {
          return false;
        }
      }

      // Wireless/wired filter for headphones
      if (filters.wireless_required !== null) {
        const isWireless = product.is_wireless || false;
        if (filters.wireless_required && !isWireless) {
          return false;
        }
        if (!filters.wireless_required && isWireless) {
          return false;
        }
      }

      // Connector type filter for wired earphones
      if (filters.connector_type) {
        const productConnector = (product.connector_type || '').toLowerCase();
        if (!productConnector.includes(filters.connector_type.toLowerCase())) {
          return false;
        }
      }

      // Brand filter
      if (filters.brand_filter && filters.brand_filter.length > 0) {
        const productBrand = (product.brand || '').toLowerCase();
        const matchesBrand = filters.brand_filter.some(brand => 
          productBrand.includes(brand.toLowerCase())
        );
        if (!matchesBrand) {
          return false;
        }
      }

      // Color filter
      if (filters.color_filter && filters.color_filter.length > 0) {
        const productColor = (product.color || '').toLowerCase();
        const matchesColor = filters.color_filter.some(color => 
          productColor.includes(color.toLowerCase())
        );
        if (!matchesColor) {
          return false;
        }
      }

      // Design style filter
      if (filters.design_filter && filters.design_filter.length > 0) {
        const productDesign = (product.design_style || '').toLowerCase();
        const matchesDesign = filters.design_filter.some(design => 
          productDesign.toLowerCase().includes(design.toLowerCase())
        );
        if (!matchesDesign) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calculate category median price
   */
  getCategoryMedian(category) {
    const categoryLower = (category || '').toLowerCase();
    
    if (categoryLower.includes('earbud')) {
      return categoryMedians.earbuds || 999;
    } else if (categoryLower.includes('headphone')) {
      return categoryMedians.headphones || 999;
    } else if (categoryLower.includes('neckband')) {
      return categoryMedians.neckbands || 424;
    } else if (categoryLower.includes('earphone')) {
      return categoryMedians.earphones || 299;
    }
    
    return 999; // Default median
  }

  /**
   * Main function: Rank products based on user preferences
   * @param {Object} answers - User's answers to questions
   * @param {String} searchQuery - Optional search query
   * @param {String} category - Optional category filter (can be overridden by filters.category)
   * @returns {Array} Ranked products with D_IQ scores
   */
  async rankProducts(answers, searchQuery = '', category = '') {
    try {
      // Map answers to weights and filters
      const { weights, filters } = this.mapAnswersToWeights(answers);

      // Use category from filters if available (from q0_category answer)
      const effectiveCategory = filters.category || category;

      // Fetch all products from online retailers
      const tables = ['amazon_products', 'flipkart_products', 'samsung_products', 'sony_products'];
      let allProducts = [];

      for (const table of tables) {
        let query = `
          SELECT 
            id,
            product_name,
            brand,
            category,
            price_inr,
            rating,
            reviews_count,
            description,
            image_url,
            product_url,
            affiliate_url,
            review_score,
            brand_score,
            has_anc,
            battery_hours,
            has_fast_charge,
            mic_quality_score,
            has_app_support,
            color,
            design_style,
            '${table.replace('_products', '')}' as retailer,
            'online' as source_type,
            NULL as store_name,
            NULL as owner_phone
          FROM ${table}
          WHERE is_deleted = FALSE
            AND price_inr IS NOT NULL
            AND price_inr > 0
        `;

        // Add search query filter
        if (searchQuery) {
          query += ` AND (
            product_name ILIKE $1 
            OR description ILIKE $1 
            OR category ILIKE $1
          )`;
        }

        // Add category filter
        if (effectiveCategory) {
          query += searchQuery 
            ? ` AND category ILIKE $2`
            : ` AND category ILIKE $1`;
        }

        const params = [];
        if (searchQuery) params.push(`%${searchQuery}%`);
        if (effectiveCategory) params.push(`%${effectiveCategory}%`);

        const result = await db.query(query, params);
        allProducts = allProducts.concat(result.rows);
      }

      // Fetch all offline store products
      try {
        // Get all offline stores
        const storesResult = await db.query('SELECT store_id, store_name, table_name, owner_phone FROM offline_stores');
        const stores = storesResult.rows;

        // Fetch products from each offline store
        for (const store of stores) {
          try {
            let offlineQuery = `
              SELECT 
                id,
                product_name,
                price as price_inr,
                -- Set default values for missing features
                NULL as brand,
                NULL as category,
                NULL as rating,
                NULL as reviews_count,
                'Offline store product - features may vary' as description,
                NULL as image_url,
                NULL as product_url,
                NULL as affiliate_url,
                0.5 as review_score,
                0.5 as brand_score,
                false as has_anc,
                0 as battery_hours,
                false as has_fast_charge,
                0.5 as mic_quality_score,
                false as has_app_support,
                NULL as color,
                NULL as design_style,
                '${store.store_name}' as retailer,
                'offline' as source_type,
                '${store.store_name}' as store_name,
                '${store.owner_phone}' as owner_phone
              FROM ${store.table_name}
              WHERE price IS NOT NULL AND price > 0
            `;

            // Add search query filter for offline products
            if (searchQuery) {
              offlineQuery += ` AND product_name ILIKE $1`;
              const offlineResult = await db.query(offlineQuery, [`%${searchQuery}%`]);
              allProducts = allProducts.concat(offlineResult.rows);
            } else {
              const offlineResult = await db.query(offlineQuery);
              allProducts = allProducts.concat(offlineResult.rows);
            }
          } catch (storeError) {
            console.error(`Error fetching products from ${store.table_name}:`, storeError.message);
            // Continue with other stores even if one fails
          }
        }
      } catch (offlineError) {
        console.error('Error fetching offline store products:', offlineError.message);
        // Continue with online products even if offline fetch fails
      }

      // Apply user filters
      const filteredProducts = this.applyFilters(allProducts, filters);

      // Calculate D_IQ scores for each product
      const scoredProducts = filteredProducts.map(product => {
        // Calculate feature score based on user preferences
        const featureScore = this.calculateFeatureScore(product, weights);

        // Calculate value score
        const valueScore = this.calculateValueScore(
          featureScore,
          product.review_score,
          product.brand_score
        );

        // Get category median
        const categoryMedian = this.getCategoryMedian(product.category);

        // Calculate D_IQ score
        const diqScore = this.calculateDIQScore(
          valueScore,
          parseFloat(product.price_inr),
          categoryMedian
        );

        // Get rating
        const diqRating = this.getDIQRating(diqScore);

        // Add disclaimer for offline products
        const isOffline = product.source_type === 'offline';
        const disclaimer = isOffline 
          ? '⚠️ This is an offline store product. Feature values are approximated based on product name and may vary from the actual product. Please verify specifications with the store owner before purchase.'
          : null;

        return {
          ...product,
          feature_score: featureScore.toFixed(4),
          value_score: valueScore.toFixed(4),
          diq_score: diqScore.toFixed(4),
          diq_rating: diqRating,
          category_median: categoryMedian,
          is_offline_product: isOffline,
          disclaimer: disclaimer,
          // Breakdown for debugging/display
          scores_breakdown: {
            feature: featureScore.toFixed(2),
            review: parseFloat(product.review_score || 0).toFixed(2),
            brand: parseFloat(product.brand_score || 0.5).toFixed(2),
            value: valueScore.toFixed(2),
            diq: diqScore.toFixed(2)
          }
        };
      });

      // Sort by D_IQ score (descending)
      scoredProducts.sort((a, b) => parseFloat(b.diq_score) - parseFloat(a.diq_score));

      return scoredProducts;
    } catch (error) {
      console.error('Error ranking products:', error);
      throw error;
    }
  }

  /**
   * Get top N products
   */
  async getTopProducts(answers, limit = 10, searchQuery = '', category = '') {
    const rankedProducts = await this.rankProducts(answers, searchQuery, category);
    return rankedProducts.slice(0, limit);
  }
}

module.exports = new DIQScoringService();
