-- Personalized Search History Migration
-- Associates search history with specific users and updates constraints

-- Step 1: Drop the existing global unique constraint on search_query
ALTER TABLE search_history DROP CONSTRAINT IF EXISTS search_history_search_query_key;

-- Step 2: Add user_id column if it doesn't exist
ALTER TABLE search_history ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Step 3: Create a unique index for (user_id, search_query)
-- This allows different users to have the same search query in their history
-- while preventing duplicates for the same user.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_search_query ON search_history(user_id, search_query);

-- Step 4: Create index for performance on user-specific history lookups
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);

-- Step 5: Add a column to track if a query should be considered for global suggestions
-- (optional, but useful for filtering sensitive or very rare queries)
ALTER TABLE search_history ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT TRUE;
