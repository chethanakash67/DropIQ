-- Create CROMA_PRODUCTS table (from Browse.ai scraping)
CREATE TABLE IF NOT EXISTS croma_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  brand TEXT DEFAULT 'Croma',
  product_id TEXT,
  category TEXT NOT NULL CHECK (category IN ('headphones', 'earbuds', 'neckbands', 'wired_earphones', 'robot_vacuums')),
  price_inr DECIMAL CHECK (price_inr >= 0),
  rating NUMERIC(2,1) CHECK (rating >= 0.0 AND rating <= 5.0),
  reviews_count INTEGER,
  description TEXT,
  features JSONB,
  specifications JSONB,
  image_url TEXT,
  product_url TEXT,
  affiliate_url TEXT,
  availability_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'out_of_stock', 'archived')),
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(product_name)
);

-- Create indexes for croma_products
CREATE INDEX IF NOT EXISTS idx_croma_category ON croma_products(category);
CREATE INDEX IF NOT EXISTS idx_croma_product_name ON croma_products(product_name);
CREATE INDEX IF NOT EXISTS idx_croma_price ON croma_products(price_inr);
CREATE INDEX IF NOT EXISTS idx_croma_rating ON croma_products(rating);
CREATE INDEX IF NOT EXISTS idx_croma_availability ON croma_products(availability_status);
