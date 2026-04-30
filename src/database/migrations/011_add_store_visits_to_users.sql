-- Track how many retailer/store visits a user has opened.
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_visits INTEGER NOT NULL DEFAULT 0;

