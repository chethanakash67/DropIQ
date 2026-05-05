-- Add detected_category column to track if category was detected from image
ALTER TABLE amazon_products ADD COLUMN IF NOT EXISTS detected_category BOOLEAN DEFAULT FALSE;
ALTER TABLE flipkart_products ADD COLUMN IF NOT EXISTS detected_category BOOLEAN DEFAULT FALSE;
ALTER TABLE samsung_products ADD COLUMN IF NOT EXISTS detected_category BOOLEAN DEFAULT FALSE;
ALTER TABLE sony_products ADD COLUMN IF NOT EXISTS detected_category BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_amazon_detected_category ON amazon_products(detected_category);
CREATE INDEX IF NOT EXISTS idx_flipkart_detected_category ON flipkart_products(detected_category);
CREATE INDEX IF NOT EXISTS idx_samsung_detected_category ON samsung_products(detected_category);
CREATE INDEX IF NOT EXISTS idx_sony_detected_category ON sony_products(detected_category);
