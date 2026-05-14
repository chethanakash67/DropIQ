-- Create oneplus_products table
CREATE TABLE IF NOT EXISTS oneplus_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    brand TEXT DEFAULT 'OnePlus',
    product_id TEXT,
    category TEXT,
    price_inr NUMERIC(12, 2),
    rating NUMERIC(3, 2),
    reviews_count INTEGER,
    description TEXT,
    features JSONB,
    specifications JSONB,
    image_url TEXT,
    product_url TEXT,
    affiliate_url TEXT,
    availability_status TEXT DEFAULT 'in_stock',
    recommendations JSONB,
    price_comparisons JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    review_score NUMERIC(3,2) DEFAULT 0,
    brand_score NUMERIC(3,2) DEFAULT 0,
    feature_score NUMERIC(3,2) DEFAULT 0,
    has_anc BOOLEAN DEFAULT FALSE,
    battery_hours NUMERIC(5,2),
    has_fast_charge BOOLEAN DEFAULT FALSE,
    mic_quality_score NUMERIC(3,2) DEFAULT 0,
    has_app_support BOOLEAN DEFAULT FALSE,
    color TEXT,
    design_style TEXT,
    detected_category BOOLEAN DEFAULT FALSE,
    classified_tag TEXT,
    UNIQUE(product_name)
);

CREATE INDEX IF NOT EXISTS idx_oneplus_product_name ON oneplus_products(product_name);
CREATE INDEX IF NOT EXISTS idx_oneplus_category ON oneplus_products(category);
CREATE INDEX IF NOT EXISTS idx_oneplus_price ON oneplus_products(price_inr);
