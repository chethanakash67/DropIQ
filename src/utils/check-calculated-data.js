const db = require('../database/db');

async function checkData() {
  try {
    console.log('🔍 Checking calculated values in database...\n');
    
    const tables = ['amazon_products', 'flipkart_products', 'samsung_products', 'sony_products'];
    
    for (const table of tables) {
      console.log(`\n📊 ${table}:`);
      console.log('='.repeat(60));
      
      const result = await db.query(`
        SELECT 
          product_name,
          review_score,
          brand_score,
          feature_score,
          has_anc,
          battery_hours,
          has_fast_charge,
          mic_quality_score,
          color,
          design_style
        FROM ${table}
        LIMIT 5
      `);
      
      result.rows.forEach((row, i) => {
        console.log(`\n${i + 1}. ${row.product_name.substring(0, 50)}`);
        console.log(`   review_score: ${row.review_score}`);
        console.log(`   brand_score: ${row.brand_score}`);
        console.log(`   feature_score: ${row.feature_score}`);
        console.log(`   has_anc: ${row.has_anc}`);
        console.log(`   battery_hours: ${row.battery_hours}`);
        console.log(`   has_fast_charge: ${row.has_fast_charge}`);
        console.log(`   mic_quality_score: ${row.mic_quality_score}`);
        console.log(`   color: ${row.color}`);
        console.log(`   design_style: ${row.design_style}`);
      });
      
      // Count non-null values
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(review_score) as with_review_score,
          COUNT(brand_score) as with_brand_score,
          COUNT(has_anc) as with_anc,
          COUNT(CASE WHEN battery_hours > 0 THEN 1 END) as with_battery,
          COUNT(color) as with_color,
          COUNT(design_style) as with_design_style
        FROM ${table}
      `);
      
      const s = stats.rows[0];
      console.log(`\n   📈 Statistics:`);
      console.log(`   Total products: ${s.total}`);
      console.log(`   With review_score: ${s.with_review_score} (${Math.round(s.with_review_score/s.total*100)}%)`);
      console.log(`   With brand_score: ${s.with_brand_score} (${Math.round(s.with_brand_score/s.total*100)}%)`);
      console.log(`   With ANC: ${s.with_anc} (${Math.round(s.with_anc/s.total*100)}%)`);
      console.log(`   With battery: ${s.with_battery} (${Math.round(s.with_battery/s.total*100)}%)`);
      console.log(`   With color: ${s.with_color} (${Math.round(s.with_color/s.total*100)}%)`);
      console.log(`   With design_style: ${s.with_design_style} (${Math.round(s.with_design_style/s.total*100)}%)`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
