# DropIQ Technical Documentation - Sections 4-5

## 4. Environment Setup & Variables

### Runtime Entry Points

- Backend source root: `backend/`.
- Backend entrypoint: `backend/src/server.js`.
- Backend package scripts:
  - `npm run dev`: starts `nodemon src/server.js`.
  - `npm start`: starts `node src/server.js`.
  - `npm run migrate`: runs `backend/src/database/migrate.js`.
  - `npm run scheduler`: runs `backend/src/scheduler/monthly-ingestion.js`.
  - `npm run scheduler:samsung`: runs `backend/src/scheduler/samsung-ingestion.js`.
  - `npm run scheduler:brands`: runs `backend/src/scheduler/brand-stores-ingestion.js`.
  - `npm run scheduler:stores`: runs `backend/src/scheduler/offline-store-sync.js`.
  - `npm run ingest`: runs Apify ingestion.
  - `npm run ingest:all`: runs all-store ingestion.
  - `npm run sync:stores`: syncs offline stores.
  - `npm run sync:supabase`: syncs configured local tables with Supabase REST.
- Landing page source root: `frontend/landing-page/`.
- Landing page scripts:
  - `npm run dev`: starts Next.js dev server.
  - `npm run build`: builds Next.js app.
  - `npm run start`: starts production Next.js server.
  - `npm run lint`: runs `tsc --noEmit`.
- Frontend wrapper scripts in `frontend/package.json`:
  - `npm run dev`: delegates to `npm --prefix ../backend run dev:all`.
  - `npm run dev:landing`: delegates to landing page dev server on port `3002`.
  - `npm run dev:client`: references `frontend/client`, which is ignored by `.gitignore`.

### Backend Local Setup

- Install backend dependencies:
  - Run from `backend/`: `npm ci`.
- Configure environment:
  - Backend loads root `.env` through `require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })` in `server.js`.
  - Database module also loads root `.env` through `backend/src/database/db.js`.
- Create/update database schema:
  - Run from `backend/`: `npm run migrate`.
  - Migration runner executes `schema.sql` first, then every `backend/src/database/migrations/*.sql` sorted lexicographically.
- Start backend:
  - Run from `backend/`: `npm run dev`.
  - Default port: `3001` unless `PORT` is set.
- Disable schedulers during local API-only work:
  - Set `DISABLE_SCHEDULERS=true`.
  - Without it, `server.js` starts monthly ingestion, Samsung ingestion, and offline-store sync schedulers.

### Landing Page Local Setup

- Install landing page dependencies:
  - Run from `frontend/landing-page/`: `npm ci`.
- Start landing page:
  - Run from `frontend/landing-page/`: `npm run dev`.
  - Backend rewrite target comes from `NEXT_PUBLIC_API_URL`, `API_URL`, or a default.
- Default backend URL in `next.config.mjs`:
  - Production: `https://dropiq-t62y.onrender.com`.
  - Development: `http://localhost:3001`.
- Login/signup behavior:
  - `/login` and `/signup` redirect to `NEXT_PUBLIC_DASHBOARD_URL` or fallback URLs.
  - They are route handlers, not local rendered pages.

### Deployment Setup

- Render deployment config: `render.yaml`.
- Render service:
  - Type: web.
  - Name: `dropiq-backend`.
  - Root directory: `backend`.
  - Runtime: Node.
  - Build command: `npm ci`.
  - Start command: `npm start`.
  - Health check: `/api/health`.
- Hosted database behavior:
  - `backend/src/database/db.js` treats `NODE_ENV=production`, `RENDER`, or `RENDER_EXTERNAL_URL` as hosted mode.
  - Hosted mode requires `DATABASE_URL`/`RENDER_DATABASE_URL`/`POSTGRES_URL` or complete discrete DB variables.
  - Hosted mode enables SSL and rewrites Supabase direct DB URLs to pooler URLs when needed.

### Variables Present In Root `.env` By Name

- Database:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
  - `DB_USER`
  - `DB_PASSWORD`
- Apify:
  - `APIFY_API_TOKEN`
  - `AMAZON_ACTOR_ID`
  - `AMAZON_API_ENDPOINT`
  - `FLIPKART_ACTOR_ID`
  - `FLIPKART_API_ENDPOINT`
  - `MYNTRA_ACTOR_ID`
  - `AMAZON_PRODUCT_LIMIT`
  - `FLIPKART_PRODUCT_LIMIT`
- Browse.ai common:
  - `BROWSEAI_API_KEY`
  - `BROWSEAI_API_KEY_AKASH`
  - `BROWSEAI_API_BASE_URL`
- Browse.ai Samsung:
  - `BROWSEAI_SAMSUNG_ROBOT_ID`
  - `BROWSEAI_SAMSUNG_TASK_ID`
- Browse.ai Croma:
  - `BROWSEAI_CROMA_ROBOT_ID`
  - `BROWSEAI_CROMA_TASK_ID`
  - `BROWSEAI_CROMA_DETAIL_ROBOT_ID`
  - `BROWSEAI_CROMA_API_KEY`
- Browse.ai Sony:
  - `BROWSEAI_SONY_ROBOT_ID`
  - `BROWSEAI_SONY_TASK_ID`
- Browse.ai Vijay Sales:
  - `BROWSEAI_VIJAYSALES_ROBOT_ID`
  - `BROWSEAI_VIJAYSALES_TASK_ID`
  - `BROWSEAI_VIJAYSALES_DETAIL_ROBOT_ID`
  - `BROWSEAI_VIJAYSALES_API_KEY`
- Browse.ai TataCliq:
  - `BROWSEAI_TATACLIQ_ROBOT_ID`
  - `BROWSEAI_TATACLIQ_DETAIL_ROBOT_ID`
  - `BROWSEAI_TATACLIQ_API_KEY`
- Browse.ai Myntra:
  - `BROWSEAI_MYNTRA_API_KEY`
  - `BROWSEAI_MYNTRA_LIST_ROBOT_ID`
  - `BROWSEAI_MYNTRA_DETAIL_ROBOT_ID`
- Browse.ai Headphones Zone:
  - `BROWSEAI_HEADPHONESZONE_API_KEY`
  - `BROWSEAI_HEADPHONESZONE_LIST_ROBOT_ID`
  - `BROWSEAI_HEADPHONESZONE_DETAIL_ROBOT_ID`
- Browse.ai Zebronics:
  - `BROWSEAI_ZEBRONICS_API_KEY`
  - `BROWSEAI_ZEBRONICS_MAIN_API`
  - `BROWSEAI_ZEBRONICS_ROBOT_ID`
  - `BROWSEAI_ZEBRONICS_TASK_ID`
  - `BROWSEAI_ZEBRONICS_DETAIL_ROBOT_ID`
  - `BROWSEAI_ZEBRONICS_DETAIL_BULK_RUN_ID`
- Gemini:
  - `GEMINI_API_KEY`
  - `GEMINI_ENABLED`
- Sovrn/VigLink:
  - `SOVRN_API_KEY`
  - `SOVRN_SECRET_KEY`
  - `SOVRN_BID_FLOOR`
- Backend server/runtime:
  - `PORT`
  - `NODE_ENV`
- Google OAuth:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_CALLBACK_URL`
- Frontend/dashboard URLs:
  - `FRONTEND_URL`
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_DASHBOARD_URL`
- JWT:
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
- Google Sheets/offline stores:
  - `GOOGLE_SHEETS_STORE_REGISTRATION_ID`
  - `STORE_SYNC_WEBHOOK_SECRET`
- Test credentials:
  - `TEST_USER_EMAIL`
  - `TEST_USER_PASSWORD`
- Supabase REST sync:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Email:
  - `EMAIL_SERVICE`
  - `EMAIL_USER`
  - `EMAIL_PASS`
  - `EMAIL_FROM_NAME`
  - `RESEND_API_KEY`

### Variables Referenced In Code But Not Present In Sampled `.env`

- Database alternatives:
  - `DATABASE_URL`
  - `RENDER_DATABASE_URL`
  - `POSTGRES_URL`
  - `PGHOST`
  - `PGPORT`
  - `PGDATABASE`
  - `PGUSER`
  - `PGPASSWORD`
  - `PGSSLMODE`
  - `DB_SSL`
- Render/system:
  - `RENDER`
  - `RENDER_EXTERNAL_URL`
- Scheduler controls:
  - `DISABLE_SCHEDULERS`
  - `OFFLINE_STORE_SYNC_SCHEDULE`
- Auth controls:
  - `AUTH_REQUIRE_EMAIL_VERIFICATION`
  - `EMAIL_OTP_EXPIRY_MINUTES`
  - `ALLOW_LOCALHOST_FRONTEND_URL`
- Contact/email:
  - `CONTACT_TO_EMAIL`
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
- Frontend/API:
  - `BACKEND_URL`
  - `API_URL`
- Notion waitlist:
  - `NOTION_TOKEN`
  - `NOTION_DATABASE_ID`
- Supabase sync controls:
  - `SUPABASE_SYNC_BATCH_SIZE`
  - `SUPABASE_SYNC_TABLES`
- Apify/Browse.ai optional job controls:
  - `MYNTRA_APIFY_TOKEN`
  - `BROWSEAI_DETAIL_CONCURRENCY`

### Required Variable Groups By Feature

- Minimum backend API with PostgreSQL:
  - Either `DATABASE_URL`, `RENDER_DATABASE_URL`, `POSTGRES_URL`, or all of `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
  - `JWT_SECRET`.
  - `JWT_REFRESH_SECRET`.
  - `PORT` optional; defaults to `3001`.
- Hosted backend on Render:
  - Database variable set as above.
  - `NODE_ENV=production` or Render-provided hosted indicators.
  - `FRONTEND_URL` or `NEXT_PUBLIC_DASHBOARD_URL` for redirects/CORS.
- Password auth with email verification:
  - `JWT_SECRET`.
  - `JWT_REFRESH_SECRET`.
  - Email variables: `EMAIL_USER`, `EMAIL_PASS`, and optionally `EMAIL_SERVICE`, `EMAIL_FROM_NAME`.
  - Production email path uses `RESEND_API_KEY` in `email-service.js`.
- Google OAuth:
  - `GOOGLE_CLIENT_ID`.
  - `GOOGLE_CLIENT_SECRET`.
  - `GOOGLE_CALLBACK_URL` optional if fallback is valid.
  - `FRONTEND_URL` or `NEXT_PUBLIC_DASHBOARD_URL` for callback redirect.
- Product ingestion from Apify:
  - `APIFY_API_TOKEN`.
  - Amazon source: `AMAZON_API_ENDPOINT` or `AMAZON_ACTOR_ID`.
  - Flipkart source: `FLIPKART_API_ENDPOINT` or `FLIPKART_ACTOR_ID`.
  - Optional limits: `AMAZON_PRODUCT_LIMIT`, `FLIPKART_PRODUCT_LIMIT`.
- Myntra Apify ingestion:
  - `APIFY_API_TOKEN` or `MYNTRA_APIFY_TOKEN` depending on job path.
  - `MYNTRA_ACTOR_ID`.
- Browse.ai ingestion:
  - Store-specific API key, list robot ID, and detail robot ID/task ID depending on job.
  - `BROWSEAI_API_BASE_URL` optional; defaults to `https://api.browse.ai/v2`.
- D_IQ search correction and feature extraction:
  - `GEMINI_API_KEY`.
  - `GEMINI_ENABLED=false` disables AI spelling correction fallback in product search.
- Sovrn affiliate/recommendation/comparison:
  - `SOVRN_API_KEY`.
  - `SOVRN_SECRET_KEY` for recommendation/comparison services.
  - `SOVRN_BID_FLOOR` for affiliate URL helpers.
- Offline store sync:
  - `GOOGLE_SHEETS_STORE_REGISTRATION_ID`.
  - Google credentials file is ignored by `.gitignore`; code references Google Sheets service paths.
  - `STORE_SYNC_WEBHOOK_SECRET` for webhook trigger/status endpoints.
- Landing page waitlist:
  - `NOTION_TOKEN`.
  - `NOTION_DATABASE_ID`.
- Landing page backend rewrites:
  - `NEXT_PUBLIC_API_URL` or `API_URL`.
  - Falls back to `http://localhost:3001` in development.
- Landing page dashboard redirects:
  - `NEXT_PUBLIC_DASHBOARD_URL`.
  - Falls back to `http://localhost:3000` in development and `https://dropiq-nine.vercel.app` in production.
- Supabase REST table sync:
  - `NEXT_PUBLIC_SUPABASE_URL`.
  - `SUPABASE_SERVICE_ROLE_KEY` preferred; `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` fallback exists in code.
  - Optional: `SUPABASE_SYNC_BATCH_SIZE`, `SUPABASE_SYNC_TABLES`.

### Runtime Defaults And Fallbacks

- Backend port:
  - `PORT || 3001`.
- Google callback URL:
  - `GOOGLE_CALLBACK_URL` if set.
  - Production fallback: `https://dropiq-t62y.onrender.com/api/auth/google/callback`.
  - Development fallback: `http://localhost:3001/api/auth/google/callback`.
- Auth frontend redirect URL:
  - `FRONTEND_URL`.
  - `NEXT_PUBLIC_DASHBOARD_URL`.
  - Production fallback: `https://dropiq-nine.vercel.app`.
  - Development fallback: `http://localhost:3000`.
  - Hosted mode rejects localhost fallback unless `ALLOW_LOCALHOST_FRONTEND_URL=true`.
- Email verification requirement:
  - If `AUTH_REQUIRE_EMAIL_VERIFICATION` is set, code uses that exact boolean string.
  - If unset, email verification is required outside hosted production.
- Email OTP expiry:
  - `EMAIL_OTP_EXPIRY_MINUTES || 10`.
- Credit refresh interval:
  - Hardcoded: 12 hours.
- Credit amounts:
  - `free`: 20.
  - `pro`: 50.
  - `max`: 75.
  - `premium` normalizes to `max`.
- Offline-store scheduler:
  - `OFFLINE_STORE_SYNC_SCHEDULE || '*/10 * * * *'`.
- Browse.ai base URL:
  - `BROWSEAI_API_BASE_URL || 'https://api.browse.ai/v2'`.
- Apify product limits:
  - `AMAZON_PRODUCT_LIMIT || 500`.
  - `FLIPKART_PRODUCT_LIMIT || 450`.
- Supabase sync batch size:
  - `SUPABASE_SYNC_BATCH_SIZE || 500`.

### Setup Risks

- Root `.env` is ignored and contains secrets; document only variable names.
- `backend/src/services/email-service.js` contains a hardcoded Resend API-key fallback string when `RESEND_API_KEY` is missing.
- `frontend/landing-page/app/api/auth/register/route.ts` proxies to backend `/api/auth/register`; backend implements `/api/auth/signup`, not `/api/auth/register`.
- `frontend/package.json` references `frontend/client`; `.gitignore` excludes `client/`, so wrapper scripts depend on local ignored source.
- Backend schedulers run in the API process by default; set `DISABLE_SCHEDULERS=true` for API-only development or multi-instance deployments.

## 5. Database Schema & Relationships

### Schema Execution Order

- Migration runner: `backend/src/database/migrate.js`.
- Execution order:
  - Runs `backend/src/database/schema.sql`.
  - Runs every `.sql` file in `backend/src/database/migrations/` sorted lexicographically.
- Current migration files:
  - `001_add_detected_category.sql`
  - `002_create_offline_stores.sql`
  - `003_auth_system.sql`
  - `004_profile_and_bag.sql`
  - `005_personalized_history.sql`
  - `006_credit_plan_refresh.sql`
  - `007_create_croma_products.sql`
  - `008_sync_croma_schema.sql`
  - `009_create_vijay_sales.sql`
  - `010_create_tatacliq_products.sql`
  - `011_add_store_visits_to_users.sql`
  - `011_create_myntra_products.sql`
  - `012_classify_zebronics_audio.sql`
  - `013_email_verification_otps.sql`
  - `014_create_zebronics_products.sql`
  - `015_create_boat_products.sql`
  - `016_create_reliance_digital_products.sql`
  - `017_create_oneplus_products.sql`
  - `018_remove_stale_offline_store_rows.sql`
- Ordering risk:
  - Two migrations use prefix `011`; lexicographic filename order currently runs `011_add_store_visits_to_users.sql` before `011_create_myntra_products.sql`.
  - Future migrations should use a unique numeric prefix.

### Product Table Model

- Product data uses one table per retailer/source.
- Tables are discovered dynamically in several product endpoints by matching `public` tables with names like `%_products`.
- Shared product-table conventions:
  - Primary key: `id UUID DEFAULT gen_random_uuid()`.
  - Natural uniqueness: `UNIQUE(product_name)` on defined retailer tables.
  - Soft deletion: `is_deleted BOOLEAN DEFAULT FALSE`.
  - Availability: `availability_status`, usually default `in_stock`.
  - Common search fields: `product_name`, `brand`, `category`, `price_inr`, `rating`, `reviews_count`, `description`.
  - Common media/link fields: `image_url`, `product_url`, `affiliate_url`.
  - Flexible detail fields: `features JSONB`, `specifications JSONB`; Amazon/Flipkart also include reviews-related JSON columns.
- Product categories constrained in base tables:
  - `headphones`
  - `earbuds`
  - `neckbands`
  - `wired_earphones`
  - `robot_vacuums`
- Later retailer tables do not always enforce the category check constraint.

### Product Tables

- `amazon_products`
  - Base schema table.
  - Source identifier: `asin`.
  - Required fields: `product_name`, `category`, `price_inr`.
  - JSON fields: `features`, `reviews`, `specifications`.
  - Indexes: category, product_name, price, rating, availability.
- `flipkart_products`
  - Base schema table.
  - Source identifier: `product_id`.
  - Required fields: `product_name`, `category`, `price_inr`.
  - JSON fields: `key_specs`, `reviews`, `specifications`.
  - Indexes: category, product_name, price, rating, availability.
- `samsung_products`
  - Base schema table.
  - Default brand: `Samsung`.
  - Source identifier: `product_id`.
  - `price_inr` nullable.
  - Indexes: category, product_name, price, rating, availability.
- `sony_products`
  - Base schema table.
  - Default brand: `Sony`.
  - Source identifier: `product_id`.
  - `price_inr` nullable.
  - Indexes: category, product_name, price, rating, availability.
- `croma_products`
  - Created in migration `007`.
  - D_IQ fields added in migration `008`.
  - Indexes: category, product_name, price, rating, availability.
- `vijay_sales_products`
  - Created in migration `009`.
  - Includes D_IQ feature fields at creation time.
  - Indexes: product_name, category.
- `tatacliq_products`
  - Created in migration `010`.
  - Includes D_IQ feature fields at creation time.
  - Indexes: product_name, category.
- `myntra_products`
  - Created in migration `011_create_myntra_products.sql`.
  - Includes D_IQ feature fields at creation time.
  - Indexes: product_name, category.
- `zebronics_products`
  - Created in migration `014`.
  - Includes D_IQ feature fields.
  - Includes `recommendations JSONB` and `price_comparisons JSONB`.
  - Indexes: product_name, category, price.
  - Migration `012` classifies existing rows into audio categories by matching product text.
- `boat_products`
  - Created in migration `015`.
  - Default brand: `boAt`.
  - Includes D_IQ feature fields.
  - Includes `recommendations JSONB` and `price_comparisons JSONB`.
  - Indexes: product_name, category, price.
- `reliance_digital_products`
  - Created in migration `016`.
  - Default brand: `Reliance Digital`.
  - Includes D_IQ feature fields.
  - Includes `recommendations JSONB` and `price_comparisons JSONB`.
  - Indexes: product_name, category, price.
- `oneplus_products`
  - Created in migration `017`.
  - Default brand: `OnePlus`.
  - Includes D_IQ feature fields.
  - Includes `recommendations JSONB` and `price_comparisons JSONB`.
  - Indexes: product_name, category, price.
- `headphones_zone_products`
  - Referenced in `backend/src/routes/products.js` as a known retailer/excluded search-index table.
  - No migration creating this table exists in the analyzed migration set.

### D_IQ Product Feature Columns

- Feature/scoring columns used by `diq-scoring-service.js`:
  - `review_score NUMERIC(3,2) DEFAULT 0`
  - `brand_score NUMERIC(3,2) DEFAULT 0`
  - `feature_score NUMERIC(3,2) DEFAULT 0`
  - `has_anc BOOLEAN DEFAULT FALSE`
  - `battery_hours NUMERIC(5,2)`
  - `has_fast_charge BOOLEAN DEFAULT FALSE`
  - `mic_quality_score NUMERIC(3,2) DEFAULT 0`
  - `has_app_support BOOLEAN DEFAULT FALSE`
  - `color TEXT`
  - `design_style TEXT`
  - `detected_category BOOLEAN DEFAULT FALSE`
  - `classified_tag TEXT`
- Base product tables initially receive only `detected_category` from migration `001`.
- Croma receives all D_IQ feature columns from migration `008`.
- Vijay Sales, TataCliq, Myntra, Zebronics, boAt, Reliance Digital, and OnePlus include D_IQ columns at creation.
- D_IQ ranking currently queries only `amazon_products`, `flipkart_products`, `samsung_products`, `sony_products`, plus dynamic offline-store tables.

### User/Auth Tables

- `users`
  - Primary key: `id SERIAL`.
  - Unique key: `email`.
  - Core fields:
    - `email`
    - `password_hash`
    - `full_name`
    - `role`
    - `plan_type`
    - `credits`
    - `credits_last_refreshed`
    - `is_active`
    - `email_verified`
    - `created_at`
    - `updated_at`
    - `last_login`
  - Profile fields added by migration `004`:
    - `phone`
    - `address`
    - `preferences`
    - `theme_preference`
  - Store-usage field added by migration `011_add_store_visits_to_users.sql`:
    - `store_visits INTEGER NOT NULL DEFAULT 0`
  - Google OAuth columns are added idempotently by runtime code in `auth-service.js`:
    - `google_id VARCHAR(255) UNIQUE`
    - `avatar_url TEXT`
  - Runtime code also relaxes `password_hash` to nullable for OAuth users.
  - Plan constraint from migration `006`:
    - `LOWER(plan_type) IN ('free', 'pro', 'max')`
    - Existing `premium` values are normalized to `max`.
  - Trigger:
    - `update_users_updated_at` updates `updated_at` before row updates.
- `refresh_tokens`
  - Primary key: `id SERIAL`.
  - Foreign key: `user_id REFERENCES users(id) ON DELETE CASCADE`.
  - Token storage: `token_hash`, not raw token.
  - Expiry/revocation fields: `expires_at`, `revoked`, `revoked_at`.
  - Self-reference: `replaced_by INTEGER REFERENCES refresh_tokens(id)`.
  - Indexes: `user_id`, `token_hash`.
- `login_attempts`
  - Primary key: `id SERIAL`.
  - Fields: `email`, `ip_address`, `attempted_at`, `success`.
  - No foreign key to `users`; cleanup on account deletion is handled manually by email in `auth-service.deleteUser`.
  - Indexes: `email`, `ip_address`, `attempted_at`.
- `email_verification_otps`
  - Primary key: `id SERIAL`.
  - Foreign key: `user_id REFERENCES users(id) ON DELETE CASCADE`.
  - Fields: `email`, `code_hash`, `expires_at`, `consumed_at`, `created_at`.
  - Active-code index: `(email, expires_at) WHERE consumed_at IS NULL`.

### User Item Tables

- `bag_items`
  - Primary key: `id SERIAL`.
  - Foreign key: `user_id REFERENCES users(id) ON DELETE CASCADE`.
  - Product reference fields are denormalized:
    - `product_id VARCHAR(255)`
    - `product_name VARCHAR(255)`
    - `retailer VARCHAR(255)`
    - `price`
    - `image_url`
  - Unique constraint: `(user_id, product_id, retailer)`.
  - No foreign key to retailer product tables.
  - Reason: products live across many retailer-specific tables with UUID ids and dynamic table names.
- `cart_items`
  - Primary key: `id SERIAL`.
  - Foreign key: `user_id REFERENCES users(id) ON DELETE CASCADE`.
  - Product reference fields mirror bag items.
  - Additional field: `quantity INTEGER DEFAULT 1`.
  - Unique constraint: `(user_id, product_id, retailer)`.
  - No foreign key to retailer product tables.

### Search History

- `search_history`
  - Primary key: `id SERIAL`.
  - Original base schema had global `UNIQUE(search_query)`.
  - Migration `005` drops the global unique constraint.
  - User-specific fields:
    - `user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`
    - `is_global BOOLEAN DEFAULT TRUE`
  - Unique index: `(user_id, search_query)`.
  - Other fields:
    - `search_query`
    - `search_count`
    - `created_at`
    - `last_searched_at`
  - Indexes: query, user_id, last searched timestamp.
- Code behavior:
  - Authenticated searches are upserted by `(user_id, search_query)`.
  - User history cleanup keeps the latest 15 searches per user.
  - Global suggestions filter on `is_global = TRUE`.

### Offline Store Tables

- `offline_stores`
  - Primary key: `id SERIAL`.
  - Unique keys:
    - `store_id`
    - `table_name`
  - Fields:
    - `store_id`
    - `store_name`
    - `owner_name`
    - `owner_phone`
    - `shop_location`
    - `preferred_time`
    - `table_name`
    - `created_at`
    - `updated_at`
    - `last_synced_at`
  - Indexes: `store_id`, `table_name`.
  - Trigger:
    - `trigger_update_offline_stores_timestamp` updates `updated_at`.
- Dynamic offline product tables:
  - `offline_stores.table_name` points to a physical table name.
  - D_IQ scoring queries each registered table dynamically.
  - Expected dynamic table fields used by scoring:
    - `id`
    - `product_name`
    - `price`
  - No SQL foreign key links `offline_stores.table_name` to the dynamic table because table names cannot be enforced as FK targets.
- Cleanup migration:
  - `018_remove_stale_offline_store_rows.sql` deletes two hardcoded stale offline store registrations.

### Supabase Sync Table Set

- `backend/src/utils/sync-supabase.js` default sync tables:
  - `users`
  - `amazon_products`
  - `flipkart_products`
  - `samsung_products`
  - `sony_products`
  - `croma_products`
  - `vijay_sales_products`
  - `tatacliq_products`
  - `myntra_products`
  - `zebronics_products`
  - `offline_stores`
  - `search_history`
  - `cart_items`
  - `bag_items`
  - `refresh_tokens`
  - `login_attempts`
- `SUPABASE_SYNC_TABLES` can override the list.
- Sync requires local tables to have primary keys.
- Sync upserts by primary key.

### Relationship Summary

- `users` -> `refresh_tokens`: one-to-many, FK cascade delete.
- `users` -> `bag_items`: one-to-many, FK cascade delete.
- `users` -> `cart_items`: one-to-many, FK cascade delete.
- `users` -> `search_history`: one-to-many, FK cascade delete.
- `users` -> `email_verification_otps`: one-to-many, FK cascade delete.
- `refresh_tokens` -> `refresh_tokens`: optional self-reference through `replaced_by`.
- `login_attempts` -> `users`: logical relation by email only; no FK.
- `bag_items`/`cart_items` -> product tables: logical relation by `product_id` and `retailer`; no FK.
- `offline_stores` -> dynamic offline product tables: logical relation through `table_name`; no FK.
- Retailer product tables are independent; no central `products` table or shared FK exists.

### Schema Risks And Technical Notes

- `auth-service.js` performs schema changes at runtime through `ensureGoogleColumns`; schema state is not controlled only by migration files.
- Product recommendation and price-comparison endpoints select/update `recommendations` and `price_comparisons`, but those columns are only present in some later product tables in the analyzed migrations.
- `diq-scoring-service.js` hardcodes online ranking tables to Amazon, Flipkart, Samsung, and Sony, despite migrations adding more retailer tables.
- Base `schema.sql` drops legacy `product_listings` and `retailers` tables.
- Product uniqueness by `product_name` can collapse distinct products with identical names within the same retailer table.
- Dynamic SQL depends on validated table names; new dynamic-table usage must keep validation against `information_schema` or strict regex checks.
