const db = require('../database/db');
const geminiService = require('../services/gemini-service');
const sovrnAffiliate = require('../utils/sovrn-affiliate');

class ProductRepository {
  /**
   * UPSERT Amazon product
   */
  async upsertAmazonProduct(productData) {
    const {
      productName,
      brand,
      asin,
      category,
      priceInr,
      rating,
      reviewsCount,
      description,
      features,
      reviews,
      specifications,
      imageUrl,
      productUrl,
      availabilityStatus,
    } = productData;

    // Generate Sovrn affiliate link
    const affiliateUrl = sovrnAffiliate.generateAffiliateLink(productUrl, {
      cuid: `amazon_${asin || productName}`,
      utm_source: 'dropiq_search',
      utm_medium: 'product_listing',
      utm_campaign: 'amazon'
    });

    try {
      const query = `
        INSERT INTO amazon_products (
          product_name, brand, asin, category, price_inr, rating, reviews_count,
          description, features, reviews, specifications, image_url, 
          product_url, affiliate_url, availability_status, last_updated
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        ON CONFLICT (product_name) 
        DO UPDATE SET
          brand = EXCLUDED.brand,
          asin = EXCLUDED.asin,
          price_inr = EXCLUDED.price_inr,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          reviews = EXCLUDED.reviews,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url,
          product_url = EXCLUDED.product_url,
          affiliate_url = EXCLUDED.affiliate_url,
          availability_status = EXCLUDED.availability_status,
          last_updated = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const values = [
        productName,
        brand || null,
        asin || null,
        category,
        priceInr,
        rating || null,
        reviewsCount || null,
        description || null,
        features || null,
        reviews || null,
        specifications || null,
        imageUrl || null,
        productUrl || null,
        affiliateUrl || null,
        availabilityStatus || 'in_stock',
      ];

      const result = await db.query(query, values);

      return {
        id: result.rows[0].id,
        inserted: result.rows[0].inserted,
      };
    } catch (error) {
      console.error('Error in upsertAmazonProduct:', error);
      throw error;
    }
  }

  /**
   * UPSERT Flipkart product
   */
  async upsertFlipkartProduct(productData) {
    const {
      productName,
      brand,
      productId,
      category,
      priceInr,
      rating,
      reviewsCount,
      description,
      keySpecs,
      reviews,
      specifications,
      imageUrl,
      productUrl,
      availabilityStatus,
    } = productData;

    // Generate Sovrn affiliate link
    const affiliateUrl = sovrnAffiliate.generateAffiliateLink(productUrl, {
      cuid: `flipkart_${productId || productName}`,
      utm_source: 'dropiq_search',
      utm_medium: 'product_listing',
      utm_campaign: 'flipkart'
    });

    try {
      const query = `
        INSERT INTO flipkart_products (
          product_name, brand, product_id, category, price_inr, rating, reviews_count,
          description, key_specs, reviews, specifications, image_url, 
          product_url, affiliate_url, availability_status, last_updated
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        ON CONFLICT (product_name) 
        DO UPDATE SET
          brand = EXCLUDED.brand,
          product_id = EXCLUDED.product_id,
          price_inr = EXCLUDED.price_inr,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          description = EXCLUDED.description,
          key_specs = EXCLUDED.key_specs,
          reviews = EXCLUDED.reviews,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url,
          product_url = EXCLUDED.product_url,
          affiliate_url = EXCLUDED.affiliate_url,
          availability_status = EXCLUDED.availability_status,
          last_updated = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const values = [
        productName,
        brand || null,
        productId || null,
        category,
        priceInr,
        rating || null,
        reviewsCount || null,
        description || null,
        keySpecs || null,
        reviews || null,
        specifications || null,
        imageUrl || null,
        productUrl || null,
        affiliateUrl || null,
        availabilityStatus || 'in_stock',
      ];

      const result = await db.query(query, values);

      return {
        id: result.rows[0].id,
        inserted: result.rows[0].inserted,
      };
    } catch (error) {
      console.error('Error in upsertFlipkartProduct:', error);
      throw error;
    }
  }

  /**
   * UPSERT Sony product
   */
  async upsertSonyProduct(productData) {
    const {
      productName,
      brand,
      productId,
      category,
      priceInr,
      rating,
      reviewsCount,
      description,
      features,
      specifications,
      imageUrl,
      productUrl,
      availabilityStatus,
    } = productData;

    try {
      // Generate Sovrn affiliate link
      const affiliateUrl = productUrl
        ? sovrnAffiliate.generateAffiliateLink(productUrl, {
          cuid: `sony_${productId || 'unknown'}`,
          utm_campaign: 'sony'
        })
        : null;

      const query = `
        INSERT INTO sony_products (
          product_name, brand, product_id, category, price_inr, rating, reviews_count,
          description, features, specifications, image_url, 
          product_url, affiliate_url, availability_status, last_updated
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        ON CONFLICT (product_name) 
        DO UPDATE SET
          brand = EXCLUDED.brand,
          product_id = EXCLUDED.product_id,
          price_inr = EXCLUDED.price_inr,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url,
          product_url = EXCLUDED.product_url,
          affiliate_url = EXCLUDED.affiliate_url,
          availability_status = EXCLUDED.availability_status,
          last_updated = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const values = [
        productName,
        brand || 'Sony',
        productId || null,
        category,
        priceInr,
        rating || null,
        reviewsCount || null,
        description || null,
        features ? JSON.stringify(features) : null,
        specifications ? JSON.stringify(specifications) : null,
        imageUrl || null,
        productUrl || null,
        affiliateUrl || null,
        availabilityStatus || 'in_stock',
      ];

      const result = await db.query(query, values);

      return {
        id: result.rows[0].id,
        inserted: result.rows[0].inserted,
      };
    } catch (error) {
      console.error('Error in upsertSonyProduct:', error);
      throw error;
    }
  }

  /**
   * Find product in specific brand table
   */
  async findProductInBrandTable(brand, productName) {
    try {
      const tableName = `${brand.toLowerCase()}_products`;
      const query = `
        SELECT id, product_name, '${brand}' as brand 
        FROM ${tableName}
        WHERE product_name ILIKE $1
        LIMIT 1
      `;
      const result = await db.query(query, [productName]);

      if (result.rows.length > 0) {
        return { found: true, data: result.rows[0] };
      }

      return { found: false };
    } catch (error) {
      console.error(`Error finding product in ${brand} table:`, error);
      return { found: false };
    }
  }

  /**
   * Search products from both tables
   */
  async searchProducts(filters = {}) {
    const {
      searchTerm = '',
      category,
      minPrice,
      maxPrice,
      retailer,
      sortBy = 'rating',
      limit = 50,
      offset = 0,
    } = filters;

    const params = [];
    let paramIndex = 1;
    let whereConditions = `WHERE p.is_deleted = FALSE AND p.availability_status = 'in_stock'`;

    // Variables to track detected keywords for intelligent sorting
    let detectedBrands = [];
    let detectedCategories = [];

    // Intelligent search term parsing
    if (searchTerm) {
      // HYBRID APPROACH: Fast hardcoded corrections + AI fallback

      // Step 1: Normalize search term
      const normalizedSearch = searchTerm.trim().replace(/\s+/g, ' ').toLowerCase();
      const searchLower = normalizedSearch;

      // Step 2: Fast hardcoded spelling corrections (EXPANDED - covers 95%+ cases)
      const spellingCorrections = {
        // Product types - comprehensive list
        'earbuds': ['earbuds', 'ear buds', 'earbud', 'earpods', 'earpod', 'ear pods', 'ear pod', 'erbuds', 'earbusd', 'earbudd', 'erbods', 'eerbods', 'airbuds', 'earbufs'],
        'headphones': ['headphones', 'headphone', 'headfones', 'hedphones', 'hadphones', 'head phones', 'headfons', 'hedphons', 'headfone', 'headpohnes'],
        'wireless': ['wireless', 'wireles', 'wirelss', 'wirless', 'wire less', 'wirles', 'wirelees', 'wireles'],
        'bluetooth': ['bluetooth', 'blutooth', 'bluetoth', 'bluethooth', 'blue tooth', 'blutoth', 'bluetooh', 'bluethoth'],
        'neckband': ['neckband', 'neckbands', 'neck band', 'neckbnd', 'neckbnad', 'nekband', 'neckbad', 'neckband'],
        'wired': ['wired', 'wierd', 'wire', 'wird', 'wir'],

        // Brands - comprehensive list with common typos
        'samsung': ['samsung', 'samsong', 'samung', 'smasung', 'sumsung', 'samsng', 'samsuong', 'samsun', 'samasung'],
        'sony': ['sony', 'soni', 'sonny', 'soony', 'soney', 'sany', 'sonu'],
        'apple': ['apple', 'aple', 'appl', 'appel', 'aplle', 'aple', 'applee'],
        'airpods': ['airpods', 'airpod', 'arpods', 'air pods', 'earpods', 'airpods', 'airpod', 'erpods', 'airposd'],
        'jbl': ['jbl', 'jbl', 'jebl', 'jbll'],
        'boat': ['boat', 'boaat', 'bot', 'boad'],
        'oneplus': ['oneplus', 'one plus', 'onepluse', '1plus', 'oneplas'],
        'realme': ['realme', 'real me', 'relme', 'reelme', 'realeme'],
        'noise': ['noise', 'nois', 'noice', 'noize'],
        'mi': ['mi', 'xiaomi', 'redmi', 'xiomi', 'shiaomi', 'mi']
      };

      // Apply fast hardcoded corrections
      let correctedSearch = searchLower;
      let hardcodedCorrectionApplied = false;

      for (const [correct, variants] of Object.entries(spellingCorrections)) {
        for (const variant of variants) {
          if (searchLower.includes(variant) && variant !== correct) {
            correctedSearch = correctedSearch.replace(new RegExp(variant, 'g'), correct);
            hardcodedCorrectionApplied = true;
          }
        }
      }

      // Step 3: AI-powered correction (fallback for unknown/complex mistakes)
      // Only call AI if hardcoded corrections weren't sufficient or query has uncommon mistakes
      let finalSearchTerm = correctedSearch;
      let aiCorrectionUsed = false;

      // Call AI only if: GEMINI_ENABLED=true AND no hardcoded correction AND query looks suspicious
      const geminiEnabled = process.env.GEMINI_ENABLED !== 'false';

      if (geminiEnabled && !hardcodedCorrectionApplied && geminiService.hasLikelyMistakes(searchLower)) {
        try {
          console.log('🤖 Using Gemini AI for spelling correction for query:', searchTerm);
          const aiResult = await geminiService.correctSpelling(searchTerm);
          console.log('🤖 AI Result:', JSON.stringify(aiResult));

          if (aiResult.confidence === 'high' && aiResult.hasMistakes) {
            finalSearchTerm = aiResult.corrected.toLowerCase();
            aiCorrectionUsed = true;
            console.log(`✅ AI correction applied: "${searchTerm}" → "${aiResult.corrected}"`);
          } else {
            console.log(`ℹ️  AI decided no correction needed (confidence: ${aiResult.confidence})`);
          }
        } catch (error) {
          console.error('❌ AI spelling correction failed:', error.message);
        }
      } else if (!geminiEnabled) {
        console.log('ℹ️  Gemini AI disabled in .env - using hardcoded corrections only');
      } else if (!hardcodedCorrectionApplied) {
        console.log('ℹ️  Query does not trigger AI correction heuristic');
      }

      // Log correction method used
      if (aiCorrectionUsed) {
        console.log(`📊 Correction method: AI (Gemini)`);
      } else if (hardcodedCorrectionApplied) {
        console.log(`📊 Correction method: Hardcoded (Fast)`);
      } else {
        console.log(`📊 No spelling corrections needed`);
      }

      // Define keyword mappings for better matching
      const brandKeywords = {
        samsung: ['samsung', 'galaxy'],
        sony: ['sony', 'wf-', 'linkbuds'],
        apple: ['apple', 'airpods', 'earpods'],
        jbl: ['jbl'],
        boat: ['boat', 'boat'],
        oneplus: ['oneplus', 'one plus', 'nord'],
        realme: ['realme', 'real me'],
        noise: ['noise'],
        ptron: ['ptron', 'p-tron'],
        mi: ['mi', 'xiaomi', 'redmi']
      };

      const categoryKeywords = {
        earbuds: ['earbuds', 'ear buds', 'earbud', 'earpods', 'ear pods', 'truly wireless', 'tws', 'bluetooth earbuds'],
        headphones: ['headphones', 'headphone', 'over ear', 'on ear', 'wireless headphones'],
        neckbands: ['neckband', 'neck band', 'neckbands', 'neck bands'],
        earphones: ['wired', 'wired earphones', 'wired earphone', 'earphone', 'earphones', 'earphones with wire', 'aux']
      };

      // Extract brand and category from corrected search term
      // (detectedBrands and detectedCategories now declared above)

      // Check for brand keywords using corrected search
      for (const [brand, keywords] of Object.entries(brandKeywords)) {
        if (keywords.some(keyword => finalSearchTerm.includes(keyword))) {
          detectedBrands.push(brand);
        }
      }

      // Check for category keywords using corrected search
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => finalSearchTerm.includes(keyword))) {
          detectedCategories.push(category);
        }
      }

      // Build intelligent search condition using corrected search term for DB query
      const searchConditions = [];

      // SMART CATEGORY FILTERING: If category detected, prioritize it but allow name/description backup
      if (detectedCategories.length > 0) {
        // Category match conditions
        const categoryConditions = detectedCategories.map(cat => {
          const condition = `p.category ILIKE $${paramIndex}`;
          params.push(`%${cat}%`);
          paramIndex++;
          return condition;
        }).join(' OR ');
        searchConditions.push(`(${categoryConditions})`);

        // Product name match (backup)
        searchConditions.push(`p.product_name ILIKE $${paramIndex}`);
        params.push(`%${finalSearchTerm}%`);
        paramIndex++;

        // Description match (backup)
        searchConditions.push(`p.description ILIKE $${paramIndex}`);
        params.push(`%${finalSearchTerm}%`);
        paramIndex++;

        // Add brand filter if detected
        if (detectedBrands.length > 0) {
          const brandConditions = detectedBrands.map(brand => {
            const condition = `p.brand ILIKE $${paramIndex}`;
            params.push(`%${brand}%`);
            paramIndex++;
            return condition;
          }).join(' OR ');
          searchConditions.push(`(${brandConditions})`);
        }

        whereConditions += ` AND (${searchConditions.join(' OR ')})`;
      } else {
        // No category detected - search broadly
        searchConditions.push(`p.product_name ILIKE $${paramIndex}`);
        params.push(`%${finalSearchTerm}%`);
        paramIndex++;

        // Add brand-specific search if detected
        if (detectedBrands.length > 0) {
          const brandConditions = detectedBrands.map(brand => {
            const condition = `p.brand ILIKE $${paramIndex}`;
            params.push(`%${brand}%`);
            paramIndex++;
            return condition;
          }).join(' OR ');
          searchConditions.push(`(${brandConditions})`);
        }

        // Also search in description
        searchConditions.push(`p.description ILIKE $${paramIndex}`);
        params.push(`%${finalSearchTerm}%`);
        paramIndex++;

        whereConditions += ` AND (${searchConditions.join(' OR ')})`;
      }
    }

    // Category filter
    if (category) {
      whereConditions += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Price range filters
    if (minPrice !== undefined) {
      whereConditions += ` AND p.price_inr >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== undefined) {
      whereConditions += ` AND p.price_inr <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    // Sorting
    let orderBy = 'ORDER BY p.rating DESC NULLS LAST';

    if (sortBy === 'price_asc') {
      orderBy = 'ORDER BY p.price_inr ASC NULLS LAST';
    } else if (sortBy === 'price_desc') {
      orderBy = 'ORDER BY p.price_inr DESC NULLS LAST';
    } else if (sortBy === 'rating') {
      orderBy = 'ORDER BY p.rating DESC NULLS LAST';
    } else if (sortBy === 'relevance' || !sortBy) {
      if (searchTerm && detectedBrands.length > 0) {
        const brandCases = detectedBrands.map((brand, idx) =>
          `WHEN p.brand ILIKE '%${brand}%' THEN ${idx + 1}`
        ).join(' ');
        orderBy = `ORDER BY CASE ${brandCases} ELSE 999 END, p.rating DESC NULLS LAST`;
      } else {
        orderBy = 'ORDER BY p.rating DESC NULLS LAST';
      }
    }

    try {
      let results = [];

      // Query Amazon if not filtered by other retailers
      if (!retailer || retailer === 'Amazon') {
        const amazonQuery = `
          SELECT 
            p.*,
            'Amazon' as retailer_name
          FROM amazon_products p
          ${whereConditions}
        `;
        const amazonResult = await db.query(amazonQuery, params);
        results = results.concat(amazonResult.rows);
      }

      // Query Flipkart if not filtered by other retailers
      if (!retailer || retailer === 'Flipkart') {
        const flipkartQuery = `
          SELECT 
            p.*,
            'Flipkart' as retailer_name
          FROM flipkart_products p
          ${whereConditions}
        `;
        const flipkartResult = await db.query(flipkartQuery, params);
        results = results.concat(flipkartResult.rows);
      }

      // Query Samsung if not filtered by other retailers
      if (!retailer || retailer === 'Samsung') {
        const samsungQuery = `
          SELECT 
            p.*,
            'Samsung' as retailer_name
          FROM samsung_products p
          ${whereConditions}
        `;
        const samsungResult = await db.query(samsungQuery, params);
        results = results.concat(samsungResult.rows);
      }

      // Query Sony if not filtered by other retailers
      if (!retailer || retailer === 'Sony') {
        const sonyQuery = `
          SELECT 
            p.*,
            'Sony' as retailer_name
          FROM sony_products p
          ${whereConditions}
        `;
        const sonyResult = await db.query(sonyQuery, params);
        results = results.concat(sonyResult.rows);
      }

      // Query Croma if not filtered by other retailers
      if (!retailer || retailer === 'Croma') {
        const cromaQuery = `
          SELECT 
            p.*,
            'Croma' as retailer_name
          FROM croma_products p
          ${whereConditions}
        `;
        const cromaResult = await db.query(cromaQuery, params);
        results = results.concat(cromaResult.rows);
      }

      // Query Vijay Sales if not filtered by other retailers
      if (!retailer || retailer === 'VijaySales') {
        const vijayQuery = `
          SELECT 
            p.*,
            'VijaySales' as retailer_name
          FROM vijay_sales_products p
          ${whereConditions}
        `;
        const vijayResult = await db.query(vijayQuery, params);
        results = results.concat(vijayResult.rows);
      }

      // Query TataCliq if not filtered by other retailers
      if (!retailer || retailer === 'TataCliq') {
        const tatacliqQuery = `
          SELECT 
            p.*,
            'TataCliq' as retailer_name
          FROM tatacliq_products p
          ${whereConditions}
        `;
        const tatacliqResult = await db.query(tatacliqQuery, params);
        results = results.concat(tatacliqResult.rows);
      }

      // Query Myntra if not filtered by other retailers
      if (!retailer || retailer === 'Myntra') {
        const myntraQuery = `
          SELECT 
            p.*,
            'Myntra' as retailer_name
          FROM myntra_products p
          ${whereConditions}
        `;
        const myntraResult = await db.query(myntraQuery, params);
        results = results.concat(myntraResult.rows);
      }

      // Query Headphones Zone if not filtered by other retailers
      if (!retailer || retailer === 'HeadphonesZone' || retailer === 'Headphones Zone') {
        const headphonesZoneQuery = `
          SELECT 
            p.*,
            'Headphones Zone' as retailer_name
          FROM headphones_zone_products p
          ${whereConditions}
        `;
        const headphonesZoneResult = await db.query(headphonesZoneQuery, params);
        results = results.concat(headphonesZoneResult.rows);
      }

      // Query Offline Stores
      if (!retailer || retailer.includes('_o')) {
        try {
          // Get all offline stores
          const offlineStoresQuery = 'SELECT store_id, store_name, table_name, owner_name, owner_phone FROM offline_stores';
          const offlineStoresResult = await db.query(offlineStoresQuery);
          
          for (const store of offlineStoresResult.rows) {
            // Skip if filtering by specific retailer and this isn't it
            if (retailer && retailer !== store.store_name && retailer !== store.store_id) {
              continue;
            }

            // Build search query for this store's products
            let storeWhereConditions = 'WHERE 1=1';
            const storeParams = [];
            let storeParamIndex = 1;

            // Search in product name
            if (searchTerm) {
              storeWhereConditions += ` AND p.product_name ILIKE $${storeParamIndex}`;
              storeParams.push(`%${searchTerm}%`);
              storeParamIndex++;
            }

            // Price filters
            if (minPrice !== undefined) {
              storeWhereConditions += ` AND p.price >= $${storeParamIndex}`;
              storeParams.push(minPrice);
              storeParamIndex++;
            }

            if (maxPrice !== undefined) {
              storeWhereConditions += ` AND p.price <= $${storeParamIndex}`;
              storeParams.push(maxPrice);
              storeParamIndex++;
            }

            // Query this store's products
            const storeQuery = `
              SELECT 
                p.id,
                p.product_name,
                p.price as price_inr,
                '${store.store_name}' as retailer_name,
                '${store.store_name}' as brand,
                'Offline Store' as category,
                NULL as rating,
                NULL as reviews_count,
                NULL as description,
                NULL as features,
                NULL as image_url,
                NULL as product_url,
                NULL as affiliate_url,
                'in_stock' as availability_status,
                p.created_at as last_updated,
                FALSE as is_deleted,
                '${store.store_id}' as store_id,
                '${store.owner_name}' as store_owner,
                '${store.owner_phone}' as store_phone
              FROM ${store.table_name} p
              ${storeWhereConditions}
            `;

            try {
              const storeResult = await db.query(storeQuery, storeParams);
              results = results.concat(storeResult.rows);
            } catch (storeError) {
              console.error(`Error querying store ${store.store_name}:`, storeError.message);
              // Continue with other stores even if one fails
            }
          }
        } catch (offlineError) {
          console.error('Error querying offline stores:', offlineError.message);
          // Continue even if offline stores query fails
        }
      }

      // Sort combined results
      // If brand keywords detected, prioritize those brands
      if (searchTerm && detectedBrands.length > 0) {
        results.sort((a, b) => {
          // Check if either product matches detected brands
          const aBrandMatch = detectedBrands.findIndex(brand =>
            a.brand && a.brand.toLowerCase().includes(brand.toLowerCase())
          );
          const bBrandMatch = detectedBrands.findIndex(brand =>
            b.brand && b.brand.toLowerCase().includes(brand.toLowerCase())
          );

          // Prioritize brand matches
          if (aBrandMatch >= 0 && bBrandMatch < 0) return -1;
          if (bBrandMatch >= 0 && aBrandMatch < 0) return 1;
          if (aBrandMatch >= 0 && bBrandMatch >= 0 && aBrandMatch !== bBrandMatch) {
            return aBrandMatch - bBrandMatch;
          }

          // Then sort by rating
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
      } else {
        // Standard sorting
        // Final sort if mixed results from multiple tables
        switch (sortBy) {
          case 'price_asc':
            results.sort((a, b) => (Number(a.price_inr || a.price) || Infinity) - (Number(b.price_inr || b.price) || Infinity));
            break;
          case 'price_desc':
            results.sort((a, b) => (Number(b.price_inr || b.price) || 0) - (Number(a.price_inr || a.price) || 0));
            break;
          case 'rating':
            results.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
            break;
          case 'relevance':
          default:
            // Relevance sort: Brand match > Rating
            results.sort((a, b) => {
              // If brands match detect brands, prioritize
              if (searchTerm && detectedBrands.length > 0) {
                const aBrandMatch = detectedBrands.some(b => a.brand?.toLowerCase().includes(b.toLowerCase()));
                const bBrandMatch = detectedBrands.some(b => b.brand?.toLowerCase().includes(b.toLowerCase()));
                if (aBrandMatch && !bBrandMatch) return -1;
                if (!aBrandMatch && bBrandMatch) return 1;
              }
              return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            });
        }
      }

      // Apply pagination
      const paginatedResults = results.slice(offset, offset + limit);

      return paginatedResults;
    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw error;
    }
  }

  /**
   * UPSERT Samsung product
   */
  async upsertSamsungProduct(productData) {
    const {
      productName,
      brand,
      productId,
      category,
      priceInr,
      rating,
      reviewsCount,
      description,
      features,
      specifications,
      imageUrl,
      productUrl,
      availabilityStatus,
    } = productData;

    try {
      // Generate Sovrn affiliate link
      const affiliateUrl = productUrl
        ? sovrnAffiliate.generateAffiliateLink(productUrl, {
          cuid: `samsung_${productId || 'unknown'}`,
          utm_campaign: 'samsung'
        })
        : null;

      const query = `
        INSERT INTO samsung_products (
          product_name, brand, product_id, category, price_inr, rating, reviews_count,
          description, features, specifications, image_url, 
          product_url, affiliate_url, availability_status, last_updated
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        ON CONFLICT (product_name) 
        DO UPDATE SET
          brand = EXCLUDED.brand,
          product_id = EXCLUDED.product_id,
          price_inr = EXCLUDED.price_inr,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url,
          product_url = EXCLUDED.product_url,
          affiliate_url = EXCLUDED.affiliate_url,
          availability_status = EXCLUDED.availability_status,
          last_updated = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const values = [
        productName,
        brand || 'Samsung',
        productId || null,
        category,
        priceInr,
        rating || null,
        reviewsCount || null,
        description || null,
        features ? JSON.stringify(features) : null,
        specifications ? JSON.stringify(specifications) : null,
        imageUrl || null,
        productUrl || null,
        affiliateUrl || null,
        availabilityStatus || 'in_stock',
      ];

      const result = await db.query(query, values);

      return {
        id: result.rows[0].id,
        inserted: result.rows[0].inserted,
      };
    } catch (error) {
      console.error('Error in upsertSamsungProduct:', error);
      throw error;
    }
  }

  /**
   * Check if product exists in Amazon or Flipkart tables by name
   */
  async findProductInRetailers(productName) {
    try {
      // Check Amazon
      const amazonQuery = `
        SELECT id, product_name, 'Amazon' as retailer 
        FROM amazon_products 
        WHERE product_name ILIKE $1
        LIMIT 1
      `;
      const amazonResult = await db.query(amazonQuery, [productName]);

      if (amazonResult.rows.length > 0) {
        return { found: true, table: 'amazon', data: amazonResult.rows[0] };
      }

      // Check Flipkart
      const flipkartQuery = `
        SELECT id, product_name, 'Flipkart' as retailer 
        FROM flipkart_products 
        WHERE product_name ILIKE $1
        LIMIT 1
      `;
      const flipkartResult = await db.query(flipkartQuery, [productName]);

      if (flipkartResult.rows.length > 0) {
        return { found: true, table: 'flipkart', data: flipkartResult.rows[0] };
      }

      return { found: false };
    } catch (error) {
      console.error('Error in findProductInRetailers:', error);
      throw error;
    }
  }

  /**
   * Update existing Amazon product with Samsung data
   */
  async updateAmazonWithSamsungData(productName, samsungData) {
    try {
      const query = `
        UPDATE amazon_products
        SET 
          price_inr = COALESCE($2, price_inr),
          rating = COALESCE($3, rating),
          reviews_count = COALESCE($4, reviews_count),
          description = COALESCE($5, description),
          image_url = COALESCE($6, image_url),
          last_updated = NOW()
        WHERE product_name ILIKE $1
        RETURNING id
      `;

      const values = [
        productName,
        samsungData.priceInr,
        samsungData.rating,
        samsungData.reviewsCount,
        samsungData.description,
        samsungData.imageUrl
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating Amazon product:', error);
      throw error;
    }
  }

  /**
   * Update existing Flipkart product with Samsung data
   */
  async updateFlipkartWithSamsungData(productName, samsungData) {
    try {
      const query = `
        UPDATE flipkart_products
        SET 
          price_inr = COALESCE($2, price_inr),
          rating = COALESCE($3, rating),
          reviews_count = COALESCE($4, reviews_count),
          description = COALESCE($5, description),
          image_url = COALESCE($6, image_url),
          last_updated = NOW()
        WHERE product_name ILIKE $1
        RETURNING id
      `;

      const values = [
        productName,
        samsungData.priceInr,
        samsungData.rating,
        samsungData.reviewsCount,
        samsungData.description,
        samsungData.imageUrl
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating Flipkart product:', error);
      throw error;
    }
  }

  /**
   * Get frequently searched categories/keywords
   */
  async getFrequentSearches() {
    return [
      'headphones',
      'earbuds',
      'neckbands',
      'wired_earphones',
      'robot_vacuums',
    ];
  }

  /**
   * Save search query to history
   */
  async saveSearchQuery(userId, searchQuery) {
    if (!searchQuery || searchQuery.trim().length === 0 || !userId) {
      return;
    }

    const query = `
      INSERT INTO search_history (user_id, search_query, search_count, last_searched_at)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (user_id, search_query)
      DO UPDATE SET
        search_count = search_history.search_count + 1,
        last_searched_at = NOW()
      RETURNING *
    `;

    try {
      const result = await db.query(query, [userId, searchQuery.trim().toLowerCase()]);
      
      // Enforce 15-search limit per user (delete oldest if > 15)
      const cleanupQuery = `
        DELETE FROM search_history 
        WHERE user_id = $1 
        AND id NOT IN (
          SELECT id FROM (
            SELECT id FROM search_history 
            WHERE user_id = $1 
            ORDER BY last_searched_at DESC 
            LIMIT 15
          ) AS recent_searches
        )
      `;
      await db.query(cleanupQuery, [userId]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error saving search query:', error);
      // Don't throw error - search history is not critical
      return null;
    }
  }

  /**
   * Get dynamic search suggestions based on global history
   */
  async getDynamicSuggestions(partialQuery, limit = 5) {
    if (!partialQuery || partialQuery.trim().length === 0) {
      return [];
    }

    const query = `
      SELECT search_query, SUM(search_count) as total_count
      FROM search_history
      WHERE search_query ILIKE $1 AND is_global = TRUE
      GROUP BY search_query
      ORDER BY total_count DESC, MAX(last_searched_at) DESC
      LIMIT $2
    `;

    try {
      const result = await db.query(query, [`${partialQuery.trim().toLowerCase()}%`, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return [];
    }
  }

  /**
   * Get recent search history for a user
   */
  async getSearchHistory(userId, limit = 15) {
    if (!userId) return [];

    const query = `
      SELECT search_query, search_count, last_searched_at
      FROM search_history
      WHERE user_id = $1
      ORDER BY last_searched_at DESC
      LIMIT $2
    `;

    try {
      const result = await db.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  }

  /**
   * Clear all search history for a user
   */
  async clearSearchHistory(userId) {
    if (!userId) return false;

    const query = `
      DELETE FROM search_history
      WHERE user_id = $1
    `;

    try {
      await db.query(query, [userId]);
      return true;
    } catch (error) {
      console.error('Error clearing search history:', error);
      return false;
    }
  }

  /**
   * Get popular searches (most searched queries)
   */
  async getPopularSearches(limit = 10) {
    const query = `
      SELECT search_query, search_count, last_searched_at
      FROM search_history
      ORDER BY search_count DESC, last_searched_at DESC
      LIMIT $1
    `;

    try {
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory() {
    const query = `DELETE FROM search_history`;

    try {
      await db.query(query);
      return { success: true };
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  /**
   * Check if a user has searched for a query recently
   */
  async hasRecentSearch(userId, searchQuery, intervalMinutes = 15) {
    if (!userId || !searchQuery) return false;
    const normalized = searchQuery.trim().toLowerCase();

    const query = `
      SELECT id 
      FROM search_history 
      WHERE user_id = $1 
        AND search_query = $2 
        AND last_searched_at >= NOW() - INTERVAL '$3 seconds'
      LIMIT 1
    `;

    try {
      const result = await db.query(query.replace('$3', intervalMinutes), [userId, normalized]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking recent search:', error);
      return false;
    }
  }

  /**
   * UPSERT Croma product
   */
  async upsertCromaProduct(productData) {
    const {
      productName,
      brand,
      productId,
      category,
      priceInr,
      rating,
      reviewsCount,
      description,
      features,
      specifications,
      imageUrl,
      productUrl,
      availabilityStatus,
    } = productData;

    try {
      // Generate Sovrn affiliate link
      const affiliateUrl = productUrl
        ? sovrnAffiliate.generateAffiliateLink(productUrl, {
          cuid: `croma_${productId || 'unknown'}`,
          utm_campaign: 'croma'
        })
        : null;

      const query = `
        INSERT INTO croma_products (
          product_name, brand, product_id, category, price_inr, rating, reviews_count,
          description, features, specifications, image_url, 
          product_url, affiliate_url, availability_status,
          review_score, brand_score, has_anc, battery_hours, has_fast_charge, 
          mic_quality_score, has_app_support, color, design_style, classified_tag,
          last_updated
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW())
        ON CONFLICT (product_name) 
        DO UPDATE SET
          brand = EXCLUDED.brand,
          product_id = EXCLUDED.product_id,
          price_inr = EXCLUDED.price_inr,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url,
          product_url = EXCLUDED.product_url,
          affiliate_url = EXCLUDED.affiliate_url,
          availability_status = EXCLUDED.availability_status,
          review_score = EXCLUDED.review_score,
          brand_score = EXCLUDED.brand_score,
          has_anc = EXCLUDED.has_anc,
          battery_hours = EXCLUDED.battery_hours,
          has_fast_charge = EXCLUDED.has_fast_charge,
          mic_quality_score = EXCLUDED.mic_quality_score,
          has_app_support = EXCLUDED.has_app_support,
          color = EXCLUDED.color,
          design_style = EXCLUDED.design_style,
          classified_tag = EXCLUDED.classified_tag,
          last_updated = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const values = [
        productName,
        brand || 'Croma',
        productId || null,
        category,
        priceInr,
        rating || null,
        reviewsCount || null,
        description || null,
        features ? JSON.stringify(features) : null,
        specifications ? JSON.stringify(specifications) : null,
        imageUrl || null,
        productUrl || null,
        affiliateUrl || null,
        availabilityStatus || 'in_stock',
        productData.reviewScore || 0,
        productData.brandScore || 0,
        productData.hasAnc || false,
        productData.batteryHours || null,
        productData.hasFastCharge || false,
        productData.micQualityScore || 0,
        productData.hasAppSupport || false,
        productData.color || null,
        productData.designStyle || null,
        productData.classifiedTag || null,
      ];

      const result = await db.query(query, values);

      return {
        id: result.rows[0].id,
        inserted: result.rows[0].inserted,
      };
    } catch (error) {
      console.error('Error in upsertCromaProduct:', error);
      throw error;
    }
  }

  /**
   * UPSERT Vijay Sales product
   */
  async upsertVijaySalesProduct(productData) {
    const {
      productName,
      brand,
      productId,
      category,
      priceInr,
      rating,
      reviewsCount,
      description,
      features,
      specifications,
      imageUrl,
      productUrl,
      availabilityStatus,
    } = productData;

    try {
      // Generate Sovrn affiliate link
      const affiliateUrl = productUrl
        ? sovrnAffiliate.generateAffiliateLink(productUrl, {
          cuid: `vijaysales_${productId || 'unknown'}`,
          utm_campaign: 'vijaysales'
        })
        : null;

      const query = `
        INSERT INTO vijay_sales_products (
          product_name, brand, product_id, category, price_inr, rating, reviews_count,
          description, features, specifications, image_url, 
          product_url, affiliate_url, availability_status,
          review_score, brand_score, has_anc, battery_hours, has_fast_charge, 
          mic_quality_score, has_app_support, color, design_style, classified_tag,
          last_updated
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW())
        ON CONFLICT (product_name) 
        DO UPDATE SET
          brand = EXCLUDED.brand,
          product_id = EXCLUDED.product_id,
          price_inr = EXCLUDED.price_inr,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url,
          product_url = EXCLUDED.product_url,
          affiliate_url = EXCLUDED.affiliate_url,
          availability_status = EXCLUDED.availability_status,
          review_score = EXCLUDED.review_score,
          brand_score = EXCLUDED.brand_score,
          has_anc = EXCLUDED.has_anc,
          battery_hours = EXCLUDED.battery_hours,
          has_fast_charge = EXCLUDED.has_fast_charge,
          mic_quality_score = EXCLUDED.mic_quality_score,
          has_app_support = EXCLUDED.has_app_support,
          color = EXCLUDED.color,
          design_style = EXCLUDED.design_style,
          classified_tag = EXCLUDED.classified_tag,
          last_updated = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const values = [
        productName,
        brand || 'Vijay Sales',
        productId || null,
        category,
        priceInr,
        rating || null,
        reviewsCount || null,
        description || null,
        features ? JSON.stringify(features) : null,
        specifications ? JSON.stringify(specifications) : null,
        imageUrl || null,
        productUrl || null,
        affiliateUrl || null,
        availabilityStatus || 'in_stock',
        productData.reviewScore || 0,
        productData.brandScore || 0,
        productData.hasAnc || false,
        productData.batteryHours || null,
        productData.hasFastCharge || false,
        productData.micQualityScore || 0,
        productData.hasAppSupport || false,
        productData.color || null,
        productData.designStyle || null,
        productData.classifiedTag || null,
      ];

      const result = await db.query(query, values);

      return {
        id: result.rows[0].id,
        inserted: result.rows[0].inserted,
      };
    } catch (error) {
      console.error('Error in upsertVijaySalesProduct:', error);
      throw error;
    }
  }

  /**
   * UPSERT TataCliq product
   */
  async upsertTataCliqProduct(productData) {
    const {
      productName, brand, productId, category, priceInr, rating, reviewsCount,
      description, features, specifications, imageUrl, productUrl, affiliateUrl,
      availabilityStatus
    } = productData;

    try {
      const query = `
        INSERT INTO tatacliq_products (
          product_name, brand, product_id, category, price_inr, rating, reviews_count,
          description, features, specifications, image_url, 
          product_url, affiliate_url, availability_status, 
          review_score, brand_score, has_anc, battery_hours,
          has_fast_charge, mic_quality_score, has_app_support,
          color, design_style, classified_tag, last_updated
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW()
        )
        ON CONFLICT (product_name) 
        DO UPDATE SET
          brand = EXCLUDED.brand,
          product_id = EXCLUDED.product_id,
          price_inr = EXCLUDED.price_inr,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url,
          product_url = EXCLUDED.product_url,
          affiliate_url = EXCLUDED.affiliate_url,
          availability_status = EXCLUDED.availability_status,
          review_score = EXCLUDED.review_score,
          brand_score = EXCLUDED.brand_score,
          has_anc = EXCLUDED.has_anc,
          battery_hours = EXCLUDED.battery_hours,
          has_fast_charge = EXCLUDED.has_fast_charge,
          mic_quality_score = EXCLUDED.mic_quality_score,
          has_app_support = EXCLUDED.has_app_support,
          color = EXCLUDED.color,
          design_style = EXCLUDED.design_style,
          classified_tag = EXCLUDED.classified_tag,
          last_updated = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const values = [
        productName,
        brand || 'TataCliq',
        productId || null,
        category,
        priceInr,
        rating || null,
        reviewsCount || null,
        description || null,
        features ? JSON.stringify(features) : null,
        specifications ? JSON.stringify(specifications) : null,
        imageUrl || null,
        productUrl || null,
        affiliateUrl || null,
        availabilityStatus || 'in_stock',
        productData.reviewScore || 0,
        productData.brandScore || 0,
        productData.hasAnc || false,
        productData.batteryHours || null,
        productData.hasFastCharge || false,
        productData.micQualityScore || 0,
        productData.hasAppSupport || false,
        productData.color || null,
        productData.designStyle || null,
        productData.classifiedTag || null,
      ];

      const result = await db.query(query, values);

      return {
        id: result.rows[0].id,
        inserted: result.rows[0].inserted,
      };
    } catch (error) {
      console.error('Error in upsertTataCliqProduct:', error);
      throw error;
    }
  }

  /**
   * UPSERT Myntra product
   */
  async upsertMyntraProduct(productData) {
    const {
      productName, brand, productId, category, priceInr, rating, reviewsCount,
      description, features, specifications, imageUrl, productUrl, affiliateUrl,
      availabilityStatus
    } = productData;

    try {
      const query = `
        INSERT INTO myntra_products (
          product_name, brand, product_id, category, price_inr, rating, reviews_count,
          description, features, specifications, image_url, 
          product_url, affiliate_url, availability_status, 
          review_score, brand_score, has_anc, battery_hours,
          has_fast_charge, mic_quality_score, has_app_support,
          color, design_style, classified_tag, last_updated
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW()
        )
        ON CONFLICT (product_name) 
        DO UPDATE SET
          brand = EXCLUDED.brand,
          product_id = EXCLUDED.product_id,
          price_inr = EXCLUDED.price_inr,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url,
          product_url = EXCLUDED.product_url,
          affiliate_url = EXCLUDED.affiliate_url,
          availability_status = EXCLUDED.availability_status,
          review_score = EXCLUDED.review_score,
          brand_score = EXCLUDED.brand_score,
          has_anc = EXCLUDED.has_anc,
          battery_hours = EXCLUDED.battery_hours,
          has_fast_charge = EXCLUDED.has_fast_charge,
          mic_quality_score = EXCLUDED.mic_quality_score,
          has_app_support = EXCLUDED.has_app_support,
          color = EXCLUDED.color,
          design_style = EXCLUDED.design_style,
          classified_tag = EXCLUDED.classified_tag,
          last_updated = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const values = [
        productName,
        brand || 'Myntra',
        productId || null,
        category,
        priceInr,
        rating || null,
        reviewsCount || null,
        description || null,
        features ? JSON.stringify(features) : null,
        specifications ? JSON.stringify(specifications) : null,
        imageUrl || null,
        productUrl || null,
        affiliateUrl || null,
        availabilityStatus || 'in_stock',
        productData.reviewScore || 0,
        productData.brandScore || 0,
        productData.hasAnc || false,
        productData.batteryHours || null,
        productData.hasFastCharge || false,
        productData.micQualityScore || 0,
        productData.hasAppSupport || false,
        productData.color || null,
        productData.designStyle || null,
        productData.classifiedTag || null,
      ];

      const result = await db.query(query, values);

      return {
        id: result.rows[0].id,
        inserted: result.rows[0].inserted,
      };
    } catch (error) {
      console.error('Error in upsertMyntraProduct:', error);
      throw error;
    }
  }
}

module.exports = new ProductRepository();
