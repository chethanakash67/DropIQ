-- Normalize plan and credit defaults for credits system

ALTER TABLE users
  ALTER COLUMN credits SET DEFAULT 20;

UPDATE users
SET plan_type = 'max'
WHERE LOWER(plan_type) = 'premium';

UPDATE users
SET plan_type = 'free'
WHERE plan_type IS NULL OR LOWER(plan_type) NOT IN ('free', 'pro', 'max');

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_plan_type_check;

ALTER TABLE users
  ADD CONSTRAINT users_plan_type_check
  CHECK (LOWER(plan_type) IN ('free', 'pro', 'max'));
