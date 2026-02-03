-- Migration: Create AMAZON_PRODUCTS and FLIPKART_PRODUCTS tables
-- Run this file to set up the database schema

-- Drop existing tables if any
DROP TABLE IF EXISTS product_listings CASCADE;
DROP TABLE IF EXISTS retailers CASCADE;

-- Create AMAZON_PRODUCTS table
CREATE TABLE IF NOT EXISTS amazon_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  brand TEXT,
  asin TEXT,
  category TEXT NOT NULL CHECK (category IN ('headphones', 'earbuds', 'neckbands', 'wired_earphones', 'robot_vacuums')),
  price_inr DECIMAL NOT NULL CHECK (price_inr >= 0),
  rating NUMERIC(2,1) CHECK (rating >= 0.0 AND rating <= 5.0),
  reviews_count INTEGER,
  description TEXT,
  features JSONB,
  reviews JSONB,
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

-- Create indexes for amazon_products
CREATE INDEX IF NOT EXISTS idx_amazon_category ON amazon_products(category);
CREATE INDEX IF NOT EXISTS idx_amazon_product_name ON amazon_products(product_name);
CREATE INDEX IF NOT EXISTS idx_amazon_price ON amazon_products(price_inr);
CREATE INDEX IF NOT EXISTS idx_amazon_rating ON amazon_products(rating);
CREATE INDEX IF NOT EXISTS idx_amazon_availability ON amazon_products(availability_status);

-- Create FLIPKART_PRODUCTS table
CREATE TABLE IF NOT EXISTS flipkart_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  brand TEXT,
  product_id TEXT,
  category TEXT NOT NULL CHECK (category IN ('headphones', 'earbuds', 'neckbands', 'wired_earphones', 'robot_vacuums')),
  price_inr DECIMAL NOT NULL CHECK (price_inr >= 0),
  rating NUMERIC(2,1) CHECK (rating >= 0.0 AND rating <= 5.0),
  reviews_count INTEGER,
  description TEXT,
  key_specs JSONB,
  reviews JSONB,
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

-- Create indexes for flipkart_products
CREATE INDEX IF NOT EXISTS idx_flipkart_category ON flipkart_products(category);
CREATE INDEX IF NOT EXISTS idx_flipkart_product_name ON flipkart_products(product_name);
CREATE INDEX IF NOT EXISTS idx_flipkart_price ON flipkart_products(price_inr);
CREATE INDEX IF NOT EXISTS idx_flipkart_rating ON flipkart_products(rating);
CREATE INDEX IF NOT EXISTS idx_flipkart_availability ON flipkart_products(availability_status);

-- Create SAMSUNG_PRODUCTS table (from Browse.ai scraping)
CREATE TABLE IF NOT EXISTS samsung_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  brand TEXT DEFAULT 'Samsung',
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

-- Create indexes for samsung_products
CREATE INDEX IF NOT EXISTS idx_samsung_category ON samsung_products(category);
CREATE INDEX IF NOT EXISTS idx_samsung_product_name ON samsung_products(product_name);
CREATE INDEX IF NOT EXISTS idx_samsung_price ON samsung_products(price_inr);
CREATE INDEX IF NOT EXISTS idx_samsung_rating ON samsung_products(rating);
CREATE INDEX IF NOT EXISTS idx_samsung_availability ON samsung_products(availability_status);

-- Create SONY_PRODUCTS table (from Browse.ai scraping)
CREATE TABLE IF NOT EXISTS sony_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  brand TEXT DEFAULT 'Sony',
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

-- Create indexes for sony_products
CREATE INDEX IF NOT EXISTS idx_sony_category ON sony_products(category);
CREATE INDEX IF NOT EXISTS idx_sony_product_name ON sony_products(product_name);
CREATE INDEX IF NOT EXISTS idx_sony_price ON sony_products(price_inr);
CREATE INDEX IF NOT EXISTS idx_sony_rating ON sony_products(rating);
CREATE INDEX IF NOT EXISTS idx_sony_availability ON sony_products(availability_status);

-- Create SEARCH_HISTORY table for caching user searches
CREATE TABLE IF NOT EXISTS search_history (
  id SERIAL PRIMARY KEY,
  search_query TEXT NOT NULL UNIQUE,
  search_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster search history queries
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(search_query);
CREATE INDEX IF NOT EXISTS idx_search_history_last_searched ON search_history(last_searched_at DESC);
