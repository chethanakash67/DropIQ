const db = require('../database/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyCouJEiHwYFnBxeoGSvRy2HN_sYetVt9S0');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Extract features from product description/name using keywords
function extractFeaturesFromText(name, description, features) {
  const text = `${name} ${description} ${features || ''}`.toLowerCase();
  
  // ANC Detection
  const hasAnc = /\b(anc|active noise cancel|noise cancellation|noise cancelling|hybrid anc|environmental noise)\b/i.test(text);
  
  // Battery Hours (look for patterns like "24h", "24 hours", "24hrs", "upto 24 hours")
  let batteryHours = 0;
  const batteryMatch = text.match(/(\d+)\s*(?:h|hr|hrs|hour|hours)(?:\s+(?:battery|playback|playtime|music time))?/i);
  if (batteryMatch) {
    batteryHours = parseInt(batteryMatch[1]);
  }
  
  // Fast Charge Detection
  const hasFastCharge = /\b(fast charg|quick charg|rapid charg|10min|asap charg)\b/i.test(text);
  
  // App Support Detection
  const hasAppSupport = /\b(app support|mobile app|companion app|bluetooth app|app control)\b/i.test(text);
  
  // Color Detection
  let color = null;
  const colorKeywords = ['black', 'white', 'blue', 'red', 'green', 'pink', 'silver', 'gold', 'grey', 'gray', 'purple', 'orange', 'yellow', 'brown', 'beige', 'navy', 'mint', 'rose', 'midnight', 'titanium', 'graphite', 'pearl', 'cosmic', 'mystic', 'aurora'];
  for (const colorWord of colorKeywords) {
    if (text.includes(colorWord)) {
      color = colorWord.charAt(0).toUpperCase() + colorWord.slice(1);
      break;
    }
  }
  
  // Design Style Detection
  let designStyle = null;
  if (/\b(tws|true wireless|truly wireless)\b/i.test(text)) {
    designStyle = 'TWS';
  } else if (/\b(neckband|neck band|wireless neckband)\b/i.test(text)) {
    designStyle = 'Neckband';
  } else if (/\b(over[-\s]?ear|over the ear)\b/i.test(text)) {
    designStyle = 'Over-Ear';
  } else if (/\b(on[-\s]?ear|on the ear)\b/i.test(text)) {
    designStyle = 'On-Ear';
  } else if (/\b(in[-\s]?ear|in the ear)\b/i.test(text)) {
    designStyle = 'In-Ear';
  } else if (/\b(wired|with wire|cable)\b/i.test(text)) {
    designStyle = 'Wired';
  }
  
  return {
    hasAnc,
    batteryHours,
    hasFastCharge,
    hasAppSupport,
    color,
    designStyle
  };
}

// Use Gemini to extract missing features
async function extractFeaturesWithGemini(name, description, features, missingFields) {
  try {
    const prompt = `You are a product feature extractor. Given the following audio product details, extract ONLY the missing features.

Product Name: ${name}
Description: ${description}
Features: ${features || 'N/A'}

Extract the following missing features and respond ONLY with valid JSON (no markdown, no explanations):
${missingFields.join(', ')}

JSON Schema:
{
  "has_anc": boolean (true if has Active Noise Cancellation),
  "battery_hours": integer (battery life in hours, 0 if not mentioned),
  "has_fast_charge": boolean (true if has fast/quick charging),
  "has_app_support": boolean (true if has mobile app support),
  "color": string (main color, null if not mentioned),
  "design_style": string (one of: TWS, Neckband, Over-Ear, On-Ear, In-Ear, Wired, null if unclear)
}

Respond with ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean response (remove markdown code blocks if present)
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    return parsed;
  } catch (error) {
    console.error(`  ⚠️  Gemini extraction failed:`, error.message);
    return null;
  }
}

// Calculate mic quality score based on brand and category
function calculateMicQualityScore(brand, category) {
  const brandLower = (brand || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  
  // Base scores by brand tier
  let baseScore = 0.5; // Default
  
  // Premium brands
  if (brandLower.includes('sony') || brandLower.includes('bose') || brandLower.includes('sennheiser')) {
    baseScore = 0.85;
  } else if (brandLower.includes('apple') || brandLower.includes('samsung')) {
    baseScore = 0.80;
  } else if (brandLower.includes('jbl') || brandLower.includes('marshall') || brandLower.includes('oneplus')) {
    baseScore = 0.75;
  } else if (brandLower.includes('realme') || brandLower.includes('mi') || brandLower.includes('xiaomi')) {
    baseScore = 0.65;
  } else if (brandLower.includes('boat') || brandLower.includes('noise')) {
    baseScore = 0.60;
  } else if (brandLower.includes('ptron') || brandLower.includes('boult')) {
    baseScore = 0.50;
  }
  
  // Category adjustments (earbuds/headphones typically have better mics)
  if (categoryLower.includes('earbud') || categoryLower.includes('tws')) {
    baseScore += 0.10;
  } else if (categoryLower.includes('headphone')) {
    baseScore += 0.05;
  }
  
  // Clamp between 0 and 1
  return Math.min(Math.max(baseScore, 0), 1);
}

async function extractAndUpdateFeatures() {
  try {
    console.log('🔍 Starting feature extraction from product data...\n');
    
    const tables = ['amazon_products', 'flipkart_products', 'samsung_products', 'sony_products'];
    let totalUpdated = 0;
    let geminiUsed = 0;
    
    for (const table of tables) {
      console.log(`\n📦 Processing ${table}...`);
      
      // Get all products from this table
      const result = await db.query(`
        SELECT id, product_name, description, features, brand, category 
        FROM ${table}
      `);
      
      const products = result.rows;
      console.log(`  Found ${products.length} products`);
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        // Extract features from text
        const extracted = extractFeaturesFromText(
          product.product_name || '',
          product.description || '',
          product.features || ''
        );
        
        // Determine which fields are still missing
        const missingFields = [];
        if (!extracted.hasAnc) missingFields.push('has_anc');
        if (extracted.batteryHours === 0) missingFields.push('battery_hours');
        if (!extracted.hasFastCharge) missingFields.push('has_fast_charge');
        if (!extracted.hasAppSupport) missingFields.push('has_app_support');
        if (!extracted.color) missingFields.push('color');
        if (!extracted.designStyle) missingFields.push('design_style');
        
        // Use Gemini for products with many missing fields
        let geminiData = null;
        if (missingFields.length >= 3) {
          console.log(`  Product ${i + 1}/${products.length}: Using Gemini for "${product.product_name.substring(0, 40)}..."`);
          geminiData = await extractFeaturesWithGemini(
            product.product_name,
            product.description,
            product.features,
            missingFields
          );
          
          if (geminiData) {
            geminiUsed++;
            // Merge Gemini data with extracted data
            extracted.hasAnc = geminiData.has_anc || extracted.hasAnc;
            extracted.batteryHours = geminiData.battery_hours || extracted.batteryHours;
            extracted.hasFastCharge = geminiData.has_fast_charge || extracted.hasFastCharge;
            extracted.hasAppSupport = geminiData.has_app_support || extracted.hasAppSupport;
            extracted.color = geminiData.color || extracted.color;
            extracted.designStyle = geminiData.design_style || extracted.designStyle;
          }
          
          // Rate limit: wait 1 second between Gemini calls
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Calculate mic quality score
        const micScore = calculateMicQualityScore(product.brand, product.category);
        
        // Update the product
        await db.query(`
          UPDATE ${table}
          SET 
            has_anc = $1,
            battery_hours = $2,
            has_fast_charge = $3,
            has_app_support = $4,
            color = $5,
            design_style = $6,
            mic_quality_score = $7
          WHERE id = $8
        `, [
          extracted.hasAnc,
          extracted.batteryHours,
          extracted.hasFastCharge,
          extracted.hasAppSupport,
          extracted.color,
          extracted.designStyle,
          micScore,
          product.id
        ]);
        
        totalUpdated++;
        
        // Progress indicator
        if ((i + 1) % 50 === 0) {
          console.log(`  Progress: ${i + 1}/${products.length} products processed`);
        }
      }
      
      console.log(`  ✅ Completed ${table}: ${products.length} products updated`);
    }
    
    console.log(`\n🎉 Feature extraction complete!`);
    console.log(`   Total products updated: ${totalUpdated}`);
    console.log(`   Gemini API calls: ${geminiUsed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during feature extraction:', error);
    process.exit(1);
  }
}

extractAndUpdateFeatures();
