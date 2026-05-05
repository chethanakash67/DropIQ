-- Create main stores table to store information about all offline stores
CREATE TABLE IF NOT EXISTS offline_stores (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(50) UNIQUE NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  owner_phone VARCHAR(20) NOT NULL,
  shop_location TEXT,
  preferred_time TIME,
  table_name VARCHAR(255) UNIQUE NOT NULL, -- The name of the individual store table (storename_o)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMP
);

-- Create index on store_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_offline_stores_store_id ON offline_stores(store_id);
CREATE INDEX IF NOT EXISTS idx_offline_stores_table_name ON offline_stores(table_name);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_offline_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_offline_stores_timestamp ON offline_stores;
CREATE TRIGGER trigger_update_offline_stores_timestamp
BEFORE UPDATE ON offline_stores
FOR EACH ROW
EXECUTE FUNCTION update_offline_stores_updated_at();
