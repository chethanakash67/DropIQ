#!/usr/bin/env node
require('dotenv').config();
const db = require('../src/database/db');
const axios = require('axios');
const imageAnalyzer = require('../src/services/image-analyzer');
let GoogleGenAI;
try {
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch (e) {
  GoogleGenAI = null;
}

const TABLES = [
  'amazon_products',
  'flipkart_products',
  'samsung_products',
  'sony_products',
];

const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT || null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || null;
const GEMINI_ENABLED = (process.env.GEMINI_ENABLED || 'false').toLowerCase() === 'true';
const USE_GOOGLE_GENAI = GEMINI_ENABLED && !!GEMINI_API_KEY && !!GoogleGenAI;

let genaiClient = null;
if (USE_GOOGLE_GENAI) {
  genaiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

async function phase1_fix_by_design_style() {
  console.log('Phase 1: Running design_style -> category SQL updates');
  for (const table of TABLES) {
    const sql = `
      UPDATE ${table}
      SET category = CASE
        WHEN design_style ILIKE '%TWS%' OR design_style ILIKE '%TWS Earbuds%' THEN 'earbuds'
        WHEN design_style ILIKE '%Earbuds%' AND design_style ILIKE '%TWS%' THEN 'earbuds'
        WHEN design_style ILIKE '%Neckband%' THEN 'neckbands'
        WHEN design_style ILIKE '%Wired%' OR design_style ILIKE '%Wired Earphones%' THEN 'wired_earphones'
        WHEN design_style ILIKE '%Over-Ear%' OR design_style ILIKE '%Over Ear%' OR design_style ILIKE '%Over Ear Headphone%' THEN 'headphones'
        ELSE category
      END
      WHERE design_style IS NOT NULL;
    `;
    try {
      const r = await db.query(sql);
      console.log(`${table}: updated rows`);
    } catch (err) {
      console.error(`Error updating ${table}:`, err.message || err);
    }
  }
}

async function ensure_classified_tag_column() {
  console.log('Ensuring column `classified_tag` exists');
  for (const table of TABLES) {
    const alter = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS classified_tag text;`;
    try {
      await db.query(alter);
    } catch (err) {
      console.error(`Error adding column to ${table}:`, err.message || err);
    }
  }
}

async function classifyWithCustomEndpoint(imageUrl) {
  if (!GEMINI_ENDPOINT || !GEMINI_API_KEY) {
    console.log('GEMINI_ENDPOINT or GEMINI_API_KEY not set; skipping remote call');
    return null;
  }

  try {
    const res = await axios.post(
      GEMINI_ENDPOINT,
      { image_url: imageUrl },
      { headers: { 'Authorization': `Bearer ${GEMINI_API_KEY}` } }
    );
    // Expecting a JSON { category: 'TWS_EARBUDS' } or similar
    if (res.data && (res.data.category || res.data.label)) {
      return (res.data.category || res.data.label).toString();
    }
    // fallback: stringified body
    return JSON.stringify(res.data);
  } catch (err) {
    console.error('Error calling custom Gemini endpoint:', err.message || err);
    return null;
  }
}

async function classifyWithGeminiVision(imageUrl) {
  if (!USE_GOOGLE_GENAI) return null;

  try {
    // download image
    const resp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(resp.data, 'binary').toString('base64');

    const prompt = `Analyze this product image and return exactly one of: headphones, earbuds, neckbands, wired_earphones. Respond with the category name only.`;

    const response = await genaiClient.models.generateContent({
      model: 'gemini-pro-vision',
      content: [
        prompt,
        {
          inlineData: {
            mimeType: resp.headers['content-type'] || 'image/jpeg',
            data: base64,
          }
        }
      ]
    });

    const text = response?.text || (response?.candidates && response.candidates[0] && response.candidates[0].content);
    if (!text) return null;
    return text.toString().trim();
  } catch (err) {
    console.error('Gemini Vision call failed:', err.message || err);
    return null;
  }
}

async function batchClassifyImages() {
  console.log('Phase 2: Adding classified_tag and processing images');
  for (const table of TABLES) {
    console.log(`Processing table: ${table}`);
    // select rows with image_url and no classified_tag yet
    const q = `SELECT id, image_url FROM ${table} WHERE image_url IS NOT NULL AND image_url <> ''`;
    try {
      const res = await db.query(q);
      console.log(`${table}: ${res.rows.length} rows to classify`);
      for (const row of res.rows) {
        const { id, image_url } = row;
        if (!image_url) continue;

        let detected = null;
        if (USE_GOOGLE_GENAI && imageAnalyzer && typeof imageAnalyzer.analyzeImage === 'function') {
          detected = await imageAnalyzer.analyzeImage(image_url);
        } else if (USE_GOOGLE_GENAI) {
          // fallback to direct gemini vision function if imageAnalyzer not available
          detected = await classifyWithGeminiVision(image_url);
        } else if (GEMINI_ENDPOINT && GEMINI_API_KEY) {
          // prefer custom endpoint if configured
          detected = await classifyWithCustomEndpoint(image_url);
        } else {
          console.log('No classifier configured (no GEMINI_ENDPOINT and GEMINI disabled); will write NULL');
        }

        // Map returned tag/label to one of the four canonical categories
        const canonical = mapTagToCanonical(detected);

        // If not identified confidently, set NULL (explicitly) as requested
        try {
          if (canonical) {
            await db.query(`UPDATE ${table} SET classified_tag = $1 WHERE id = $2`, [canonical, id]);
            console.log(`Updated id=${id} -> ${canonical}`);
          } else {
            await db.query(`UPDATE ${table} SET classified_tag = NULL WHERE id = $1`, [id]);
            console.log(`Updated id=${id} -> NULL (ambiguous)`);
          }
        } catch (uerr) {
          console.error(`Error updating id=${id} in ${table}:`, uerr.message || uerr);
        }
      }
    } catch (err) {
      console.error(`Error selecting from ${table}:`, err.message || err);
    }
  }
}

function mapTagToCanonical(raw) {
  if (!raw) return null;
  const s = raw.toString().toLowerCase();

  // earbuds (TWS / true wireless / earbud)
  if (/tws|true\s*wireless|earbud|earbuds|in[- ]?ear\b/.test(s)) return 'earbuds';

  // neckbands
  if (/neckband/.test(s)) return 'neckbands';

  // wired earphones (look for jack/3.5mm/aux/cable/wired)
  if (/3\.5mm|3mm|3\.5|3 5|aux|jack|wired|cable/.test(s)) return 'wired_earphones';

  // headphones / over-ear / on-ear / headset
  if (/over[- ]?ear|on[- ]?ear|headphone|headset/.test(s)) return 'headphones';

  // If classifier returned a structured JSON with label or category
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed) {
      const candidate = (parsed.category || parsed.label || parsed.result || parsed.tag || '').toString().toLowerCase();
      if (candidate) return mapTagToCanonical(candidate);
    }
  } catch (_) {
    // not JSON, ignore
  }

  return null;
}

async function main() {
  console.log('Categorization script starting');

  // Phase 1
  await phase1_fix_by_design_style();

  // Phase 2
  await ensure_classified_tag_column();
  await batchClassifyImages();

  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
