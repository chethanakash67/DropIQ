-- Add missing columns to croma_products to match other store tables
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS review_score NUMERIC(3,2) DEFAULT 0;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS brand_score NUMERIC(3,2) DEFAULT 0;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS feature_score NUMERIC(3,2) DEFAULT 0;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS has_anc BOOLEAN DEFAULT FALSE;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS battery_hours NUMERIC(5,2);
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS has_fast_charge BOOLEAN DEFAULT FALSE;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS mic_quality_score NUMERIC(3,2) DEFAULT 0;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS has_app_support BOOLEAN DEFAULT FALSE;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS design_style TEXT;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS detected_category BOOLEAN DEFAULT FALSE;
ALTER TABLE croma_products ADD COLUMN IF NOT EXISTS classified_tag TEXT;
