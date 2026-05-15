# DropIQ Technical Documentation - Sections 6-9

## 6. API Reference

### API Base

- Backend API entrypoint: `backend/src/server.js`.
- Base URL in local backend: `http://localhost:3001`.
- Health check:
  - `GET /api/health`
  - Auth: none.
  - Response: `{ success: true, message: 'DropIQ API running', timestamp }`.
- JSON convention:
  - Most API responses include `success`.
  - Errors commonly use `error`, with optional `message` or `details`.

### Auth Header Convention

- Protected routes use:
  - `Authorization: Bearer <accessToken>`.
- Access token is a JWT created by `auth-service.generateAccessToken`.
- Refresh token is sent in JSON body for refresh/logout operations.

### Auth API

- `POST /api/auth/signup`
  - Auth: none.
  - Rate limit: in-memory 5 requests per 15 minutes per IP.
  - Body: `{ email, password, fullName }`.
  - Validation:
    - Email required and regex-validated.
    - Password requires at least 8 chars, uppercase, lowercase, and number.
  - Behavior:
    - Normalizes email to lowercase.
    - Creates user with bcrypt password hash.
    - If email verification is required, creates OTP and returns `requiresVerification: true`.
    - If email verification is not required, returns `user`, `accessToken`, `refreshToken`.
  - Conflict:
    - Existing verified user returns `409`.
    - Existing unverified user triggers a new OTP and returns `200`.
- `POST /api/auth/verify-email`
  - Auth: none.
  - Rate limit: same in-memory limiter.
  - Body: `{ email, otp }`.
  - Behavior:
    - Validates 6-digit OTP through HMAC hash lookup.
    - Marks user `email_verified=true`.
    - Returns `user`, `accessToken`, `refreshToken`.
- `POST /api/auth/resend-otp`
  - Auth: none.
  - Rate limit: same in-memory limiter.
  - Body: `{ email }`.
  - Behavior:
    - Requires unverified account.
    - Creates and sends/reports a new OTP.
- `POST /api/auth/login`
  - Auth: none.
  - Rate limit:
    - In-memory IP limiter.
    - DB-backed failed-login limiter by email or IP over 15 minutes.
  - Body: `{ email, password }`.
  - Behavior:
    - Verifies password with bcrypt.
    - Blocks inactive users.
    - If email verification is required and user is unverified, sends OTP and returns `403`.
    - Records login attempt and updates `last_login`.
    - Returns `user`, `accessToken`, `refreshToken`.
- `POST /api/auth/refresh`
  - Auth: none.
  - Body: `{ refreshToken }`.
  - Behavior:
    - Verifies refresh JWT signature.
    - Verifies hashed token exists in `refresh_tokens`, is not revoked, and is not expired.
    - Returns a new access token only.
- `POST /api/auth/logout`
  - Auth: required.
  - Body: `{ refreshToken }`.
  - Behavior:
    - Revokes supplied refresh token by hash.
- `POST /api/auth/logout-all`
  - Auth: required.
  - Behavior:
    - Revokes all active refresh tokens for current user.
- `GET /api/auth/me`
  - Auth: required.
  - Behavior:
    - Returns current profile, preferences, role, plan, credits, email verification status, timestamps.
    - Auth middleware refreshes credits before response.
- `PATCH /api/auth/me`
  - Auth: required.
  - Body fields consumed by service: `fullName`, `phone`, `address`, `themePreference`, `preferences`.
  - Behavior: updates profile fields with `COALESCE`; absent fields keep existing DB values.
- `DELETE /api/auth/me`
  - Auth: required.
  - Behavior:
    - Deletes login attempts for user email.
    - Deletes user.
    - DB cascades refresh tokens, bag items, cart items, and search history.
- `DELETE /api/auth/me/data`
  - Auth: required.
  - Behavior: clears current user's bag and cart.
- `PATCH /api/auth/me/password`
  - Auth: required.
  - Body: `{ currentPassword, newPassword }`.
  - Behavior:
    - Verifies current password.
    - Rejects OAuth-only users without a password hash.
    - Hashes and stores new password.
  - Missing validation:
    - Route does not enforce the signup password complexity rule for `newPassword`.
- `PATCH /api/auth/me/preferences`
  - Auth: required.
  - Body: `{ preferences }`.
  - Behavior: updates `users.preferences`.
- `POST /api/auth/me/increment-visits`
  - Auth: required.
  - Behavior: increments `users.store_visits` by 1.
- `POST /api/auth/upgrade-plan`
  - Auth: required.
  - Body: `{ planType }`.
  - Accepted values: `pro`, `max`, `premium`.
  - Behavior:
    - Adds 50 credits for `pro`.
    - Adds 75 credits for `max` or `premium`.
    - Updates `credits_last_refreshed`.
    - Response normalizes `premium` to `max`.
- `GET /api/auth/google`
  - Auth: none.
  - Behavior: starts Passport Google OAuth flow with `profile` and `email` scopes.
- `GET /api/auth/google/callback`
  - Auth: Google OAuth callback.
  - Behavior:
    - Finds or creates/links user.
    - Issues access and refresh tokens.
    - Redirects to `${FRONTEND_URL}/auth/callback?token=...&refresh=...`.
  - Failure redirects:
    - Google failure: `${FRONTEND_URL}/login?error=google_failed`.
    - Internal callback failure: `${FRONTEND_URL}/login?error=oauth_failed`.

### Bag And Cart API

- `GET /api/auth/me/bag`
  - Auth: required.
  - Response: current user's `bag_items`, newest first.
- `POST /api/auth/me/bag`
  - Auth: required.
  - Body: `{ product }`.
  - Product fields consumed: `id`, `product_name` or `name`, `price_inr`, `image_url`, `retailer_name` or `retailer`.
  - Behavior: inserts into `bag_items`; duplicate `(user_id, product_id, retailer)` is ignored.
- `DELETE /api/auth/me/bag/:productId`
  - Auth: required.
  - Query: `retailer`.
  - Behavior: deletes matching bag item for current user.
- `POST /api/auth/me/bag/sync`
  - Auth: required.
  - Body: `{ items }`.
  - Behavior: transactionally deletes current user's bag and reinserts supplied items.
- `GET /api/auth/me/cart`
  - Auth: required.
  - Response: current user's `cart_items`, newest first.
- `POST /api/auth/me/cart/sync`
  - Auth: required.
  - Body: `{ items }`.
  - Behavior: transactionally deletes current user's cart and reinserts supplied items with `quantity || 1`.

### Products API

- `GET /api/products/search`
  - Auth: optional, required only when `chargeCredits=true` and `q` is non-empty.
  - Query:
    - `q`
    - `category`
    - `minPrice`
    - `maxPrice`
    - `retailer`
    - `sortBy`: `rating`, `price_asc`, `price_desc`
    - `limit`, default `50`
    - `offset`, default `0`
    - `chargeCredits=true`
  - Behavior:
    - Consumes 3 credits when charging applies.
    - Skips charge for same exact user/query found in recent search window.
    - Searches product repository.
    - Saves authenticated non-empty searches asynchronously.
  - 402 response:
    - `{ error: 'INSUFFICIENT_CREDITS', requiredCredits, availableCredits, redirectTo: '/plans' }`.
- `GET /api/products/search-history`
  - Auth: required.
  - Query: `limit`, default `15`.
  - Response: user-specific search history ordered by most recent.
- `DELETE /api/products/search-history`
  - Auth: required in effective route order.
  - Behavior: clears current user's search history.
  - Implementation note:
    - A second unauthenticated `DELETE /search-history` is registered later, but Express reaches the first authenticated route first; unauthenticated callers receive `401`.
- `GET /api/products/popular-searches`
  - Auth: none.
  - Query: `limit`, default `10`.
  - Response: search history rows ordered by search count then last searched.
- `GET /api/products/retailers`
  - Auth: none.
  - Behavior:
    - Discovers `*_products` tables.
    - Counts in-stock, non-deleted, named rows with valid price per table.
    - Returns retailers with count > 0.
- `GET /api/products/search-index`
  - Auth: none.
  - Behavior:
    - Discovers `*_products` tables.
    - Excludes `headphones_zone_products`.
    - Returns lightweight product index fields: `id`, `product_name`, `brand`, `category`, `price_inr`, `image_url`, `normalized_key`, `retailer_name`.
- `GET /api/products/search-suggestions`
  - Auth: none.
  - Query: `q`, `limit`, default `5`.
  - Behavior: returns global search suggestions from `search_history` where `is_global=true`.
- `GET /api/products/frequent-searches`
  - Auth: none.
  - Behavior: returns static list from repository: `headphones`, `earbuds`, `neckbands`, `wired_earphones`, `robot_vacuums`.
- `GET /api/products/:id`
  - Auth: none.
  - Query: optional `retailer`.
  - Behavior:
    - If retailer is provided, resolves retailer product table or offline-store table first.
    - Falls back to scanning all discovered product tables.
    - Last resort scans dynamic offline-store tables.
    - Returns 404 if no product is found.
- `GET /api/products/:retailer/:id/recommendations`
  - Auth: none.
  - Behavior:
    - Resolves retailer to a product table.
    - Reads cached `recommendations`.
    - If empty, calls Sovrn recommendations and caches response to product row.
  - Schema risk:
    - Route selects `recommendations`; not every product table migration defines that column.
- `GET /api/products/:retailer/:id/price-comparisons`
  - Auth: none.
  - Behavior:
    - Resolves retailer to a product table.
    - Reads cached `price_comparisons`.
    - If empty, calls Sovrn comparison API and caches response to product row.
  - Schema risk:
    - Route selects `price_comparisons`; not every product table migration defines that column.

### D_IQ API

- `GET /api/diq/questions`
  - Auth: none.
  - Behavior: returns default exported questions, currently category selector plus earbuds questions.
- `GET /api/diq/questions/:category`
  - Auth: none.
  - Supported categories from config:
    - `earbuds`
    - `headphones`
    - `neckbands`
    - `earphones`
  - Behavior: returns category selector plus category-specific questions.
- `POST /api/diq/recommendations`
  - Auth: required.
  - Body:
    - `answers`: required object keyed by question IDs.
    - `limit`: default `10`.
    - `searchQuery`: default empty string.
    - `category`: default empty string.
  - Behavior:
    - Consumes 7 credits.
    - Ranks products through `diq-scoring-service`.
    - Free users get `isLocked=true` on first two products.
    - Returns remaining credits and credit cost.
  - 402 response uses `INSUFFICIENT_CREDITS`.
- `POST /api/diq/calculate-scores`
  - Auth: none.
  - Body: `answers`, optional `searchQuery`, optional `category`.
  - Behavior:
    - Returns full ranked list, grouped count by D_IQ rating, and top 10 products.
    - Does not consume credits.
- `GET /api/diq/test`
  - Auth: none.
  - Behavior: runs a sample answer set and returns top 5 products.
  - Risk:
    - Sample code indexes `diqQuestions` as an array; exported default includes category question plus earbuds questions.

### Webhooks API

- `POST /api/webhooks/form-store-sync`
  - Auth: shared secret header.
  - Required header: `x-sync-secret`.
  - Optional duplicate guard:
    - Header `x-event-id` or body `eventId`.
    - Duplicate event IDs are ignored for 10 minutes in memory.
  - Behavior:
    - Calls `triggerStoreSync({ source: 'webhook:google-form' })`.
    - Returns `202` with accepted/in-progress status.
- `GET /api/webhooks/form-store-sync/status`
  - Auth: shared secret header.
  - Required header: `x-sync-secret`.
  - Response: `getStoreSyncStatus()`.

### Contact API

- `POST /api/contact`
  - Auth: none.
  - Body: `{ name, email, message }`.
  - Validation:
    - All fields required.
    - Email regex validated.
    - Message length max 5000 chars.
  - Behavior:
    - Sends message to `CONTACT_TO_EMAIL` or default.
    - Sends acknowledgement email to submitter.
    - Uses Gmail transporter from `EMAIL_USER` and `EMAIL_PASS`.

### Landing Page Route Handlers

- `POST /api/waitlist`
  - App: `frontend/landing-page`.
  - Body: `{ email }`.
  - Behavior:
    - Validates email.
    - Checks Notion database for duplicate `Email`.
    - Creates Notion page with `Email` and `SubmittedAt`.
- `POST /api/auth/login`
  - App: `frontend/landing-page`.
  - Behavior: proxies request body to `${BACKEND_URL}/api/auth/login`.
- `POST /api/auth/register`
  - App: `frontend/landing-page`.
  - Behavior: proxies request body to `${BACKEND_URL}/api/auth/register`.
  - Contract issue: backend route is `/api/auth/signup`, not `/api/auth/register`.
- `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/verify`
  - App: `frontend/landing-page`.
  - Behavior: proxy-style auth route handlers exist under `app/api/auth/*`.
- `GET /login`, `GET /signup`
  - App: `frontend/landing-page`.
  - Behavior: redirect to dashboard login/signup paths.
- `GET /auth/callback`, `HEAD /auth/callback`
  - App: `frontend/landing-page`.
  - Behavior: redirects callback query string to dashboard `/auth/callback`.

## 7. Key Features & Implementation Logic

### Product Search

- Route: `GET /api/products/search`.
- Repository: `backend/src/repositories/product-repository.js`.
- Search input handling:
  - Normalizes whitespace and lowercases the query.
  - Applies hardcoded typo corrections for common product/brand terms.
  - Calls Gemini only when:
    - `GEMINI_ENABLED !== 'false'`.
    - No hardcoded correction was applied.
    - `geminiService.hasLikelyMistakes()` detects known misspellings.
  - Uses AI correction only on high-confidence mistake responses.
- Query understanding:
  - Detects brands from keyword maps: Samsung, Sony, Apple, JBL, boAt, OnePlus, Zebronics, Realme, Noise, pTron, MI/Xiaomi.
  - Detects categories from keyword maps: earbuds, headphones, neckbands, wired earphones, earphones.
  - Expands category aliases to catch product-name/category variants.
- Filters:
  - `category`.
  - `minPrice`.
  - `maxPrice`.
  - `retailer`.
  - `availability_status='in_stock'`.
  - `is_deleted=false`.
  - Price must be null or `>= 1`.
- Sorting:
  - Defaults to rating.
  - Supports ascending/descending price.
  - Search logic adds relevance behavior when brand/category are detected.
- Credit behavior:
  - Search costs 3 credits only when `chargeCredits=true` and query exists.
  - Same exact query by the same user in the recent check window avoids duplicate charging.

### Dynamic Retailer Discovery

- Product routes discover retailer tables from `information_schema.tables`.
- Table eligibility:
  - Schema: `public`.
  - Table type: `BASE TABLE`.
  - Name like `%_products`.
  - Name matches `/^[a-z0-9_]+$/`.
- Display names:
  - Known labels are hardcoded in `PRODUCT_TABLE_LABELS`.
  - Unknown names derive from table name by stripping `_products` and title-casing words.
- Retailer aliases:
  - Zebronics accepts `Zepronics`, `Zebronix`, `Zeb`.
- Why it exists:
  - Generic search/index/detail endpoints can support new retailer product tables without adding a new route.

### Product Details

- Route: `GET /api/products/:id`.
- Resolution order:
  - If `retailer` query is present, try matching retailer product table first.
  - If retailer is not a product table, check `offline_stores` by `store_name` or `store_id`.
  - If not found, scan all discovered `*_products` tables.
  - Last, scan all registered offline-store product tables.
- Offline table safety:
  - Offline table names are joined through `information_schema`.
  - `offline_stores.table_name` must match `^[a-z0-9_]+$`.

### D_IQ Questionnaire

- Config file: `backend/src/config/diq-questions.js`.
- Supported categories:
  - `earbuds`.
  - `headphones`.
  - `neckbands`.
  - `earphones`.
- Each category returns:
  - A common category-selector question.
  - Category-specific questions with options.
- Option metadata can include:
  - `scoring`: numeric weights and/or hard filters.
  - `filters`: hard filtering fields.
  - `priceRange`: min/max price.
  - `description`, `spec`, `helpText`.
- Backward compatibility:
  - Default export returns category selector plus earbuds questions.

### D_IQ Scoring

- Service: `backend/src/services/diq-scoring-service.js`.
- Main methods:
  - `mapAnswersToWeights`.
  - `applyFilters`.
  - `calculateFeatureScore`.
  - `calculateValueScore`.
  - `calculateDIQScore`.
  - `rankProducts`.
  - `getTopProducts`.
- Feature score weights:
  - ANC: `0.30`.
  - Battery: `0.20`.
  - Fast charge: `0.15`.
  - Mic quality: `0.25`.
  - App support: `0.10`.
- Feature normalization:
  - `has_anc`: boolean to 0/1.
  - `battery_hours`: normalized with 24+ hours as 1.
  - `has_fast_charge`: boolean to 0/1.
  - `mic_quality_score`: parsed number or default `0.5`.
  - `has_app_support`: boolean to 0/1.
- Value score:
  - `0.45 * feature_score + 0.35 * review_score + 0.20 * brand_score`.
- D_IQ score:
  - `value_score / (price / category_median_price)`.
- Rating thresholds:
  - `>= 1.2`: Excellent.
  - `>= 1.0`: Good.
  - `>= 0.8`: Fair.
  - Otherwise: Poor.
- Online ranking scope:
  - `amazon_products`.
  - `flipkart_products`.
  - `samsung_products`.
  - `sony_products`.
- Offline products:
  - Loaded from `offline_stores.table_name`.
  - Normalized with default feature values.
  - Returned with `is_offline_product=true` and disclaimer.
- Free-plan lock:
  - `/api/diq/recommendations` sets `isLocked=true` for first two products when `req.user.planType === 'free'`.

### Credits And Plans

- Service: `backend/src/services/credits-service.js`.
- Plan normalization:
  - Empty/unknown -> `free`.
  - `premium` -> `max`.
  - Accepted normalized plans: `free`, `pro`, `max`.
- Refresh interval:
  - 12 hours.
- Refresh amounts:
  - `free`: 20.
  - `pro`: 50.
  - `max`: 75.
- Consumption:
  - Search: 3 credits when charged.
  - D_IQ recommendations: 7 credits.
  - Credit consumption runs in DB transaction.
  - Duplicate charge guard:
    - In-memory `Map`.
    - Same user and same cost within 3 seconds returns current state without deducting again.
- Insufficient credits:
  - Throws `InsufficientCreditsError`.
  - Routes map it to HTTP `402`.

### Bag And Cart Persistence

- Service: `backend/src/services/user-items-service.js`.
- Tables:
  - `bag_items`.
  - `cart_items`.
- Persistence model:
  - Product reference is denormalized into item tables.
  - No foreign key to product tables.
  - Reason: products can live in many retailer-specific or offline dynamic tables.
- Sync behavior:
  - Bag sync deletes all current user's bag rows and reinserts supplied items.
  - Cart sync deletes all current user's cart rows and reinserts supplied items.
  - Both run inside explicit transactions.

### Offline Store Sync

- Job: `backend/src/jobs/sync-offline-stores.js`.
- Trigger paths:
  - Scheduled via `scheduler/offline-store-sync.js`.
  - Manual script `npm run sync:stores`.
  - Webhook `POST /api/webhooks/form-store-sync`.
- Data source:
  - Google Sheets range `Form responses 1`.
  - Spreadsheet ID from `GOOGLE_SHEETS_STORE_REGISTRATION_ID`.
- Store ID generation:
  - First 4 phone digits.
  - First 2 shop-name letters.
  - First 2 owner-name letters.
  - Format: `1234-SH-OW`.
- Table name generation:
  - Lowercase store name.
  - Remove non-alphanumeric/space.
  - Replace spaces with underscores.
  - Limit to 50 chars.
  - Append `_o`.
- Product parse format:
  - Lines like `Product Name - Rs. 14,999`.
  - Inserts `{ name, price }`.
- Sync concurrency:
  - `activeSyncPromise` prevents overlapping sync runs in the same process.
- Webhook duplicate guard:
  - `recentEventIds` in-memory map with 10-minute TTL.

### Affiliate Links, Recommendations, Price Comparison

- Affiliate URL generation:
  - Utility: `backend/src/utils/sovrn-affiliate.js`.
  - Wraps destination URL as `https://sovrn.co?key=...&u=...&bf=...&fbu=...`.
  - Adds optional `cuid`, `utm_source`, `utm_medium`, `utm_campaign`.
  - If `SOVRN_API_KEY` is missing, returns original URL.
- Product recommendations:
  - Service: `sovrn-recommendations.js`.
  - API: `https://shopping-gallery.prd-commerce.sovrnservices.com/ai-orchestration/products`.
  - Uses product name/category/price/description to generate content.
  - Converts USD response prices to INR using fixed rate `83`.
  - Route caches successful results in product table `recommendations`.
- Price comparisons:
  - Service: `sovrn-price-comparison.js`.
  - API: `https://comparisons.sovrn.com/api/affiliate/v3.5`.
  - Searches by cleaned product-name keywords.
  - Adds ±30% USD price range when local INR price exists.
  - Sorts transformed results by INR price ascending.
  - Route caches successful results in product table `price_comparisons`.

## 8. Third-Party Integrations

### PostgreSQL

- Library: `pg`.
- Integration module: `backend/src/database/db.js`.
- Used by:
  - Routes, services, repositories, jobs, migration runner.
- Hosted behavior:
  - SSL enabled.
  - Supabase direct host rewrite to pooler URL in hosted mode.

### Supabase

- Packages:
  - `@supabase/supabase-js`.
  - `@supabase/ssr`.
  - `supabase` CLI dev dependency.
- Actual analyzed usage:
  - `backend/src/utils/sync-supabase.js` uses Supabase REST endpoint directly with `fetch`.
- Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`.
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
  - `SUPABASE_SERVICE_ROLE_KEY`.
  - Optional `SUPABASE_SYNC_BATCH_SIZE`.
  - Optional `SUPABASE_SYNC_TABLES`.
- Behavior:
  - Pulls remote rows into local PostgreSQL.
  - Pushes local rows to Supabase REST.
  - Upserts by primary key.

### Apify

- Library: `axios`.
- Client: `backend/src/services/apify-client.js`.
- Jobs:
  - `ingest-apify-data.js`.
  - `ingest-myntra-apify.js`.
- Variables:
  - `APIFY_API_TOKEN`.
  - `AMAZON_API_ENDPOINT` or `AMAZON_ACTOR_ID`.
  - `FLIPKART_API_ENDPOINT` or `FLIPKART_ACTOR_ID`.
  - `AMAZON_PRODUCT_LIMIT`.
  - `FLIPKART_PRODUCT_LIMIT`.
  - `MYNTRA_ACTOR_ID`.
  - `MYNTRA_APIFY_TOKEN` in Myntra job path.
- Fetch modes:
  - Configured dataset/actor endpoint.
  - Fallback to latest successful actor run and its dataset.
- Failure behavior:
  - Individual source failures return empty array.
  - If all sources fail and no products are fetched, client throws.

### Browse.ai

- Library: `axios`.
- Client: `backend/src/services/browseai-client.js`.
- Jobs:
  - Samsung, Sony, Croma, Vijay Sales, TataCliq, Myntra, Headphones Zone, Zebronics, generic retailer ingestion paths.
- Variables:
  - `BROWSEAI_API_KEY`.
  - Store-specific API keys.
  - Store-specific robot IDs.
  - Store-specific task/detail robot IDs.
  - `BROWSEAI_API_BASE_URL`.
- Behavior:
  - Reads robot task data.
  - Uses configured task ID or fetches latest successful task when task ID is missing.
  - Supports captured lists and captured text payload shapes.
  - Can trigger a fresh robot task through `runRobot`.

### Google Sheets

- Package: `googleapis`.
- Service: `backend/src/services/google-sheets-service.js`.
- Job: `backend/src/jobs/sync-offline-stores.js`.
- Credentials:
  - Hardcoded key-file path: `backend/gen-lang-client-0169377687-30900ec04eb4.json`.
  - The JSON credential file is ignored by `.gitignore`.
- Scope:
  - `https://www.googleapis.com/auth/spreadsheets.readonly`.
- Used for:
  - Offline store registration sync.
  - Store metadata and product line ingestion.

### Gemini

- Packages:
  - `@google/genai`.
  - `@google/generative-ai`.
- Service: `backend/src/services/gemini-service.js`.
- Variables:
  - `GEMINI_API_KEY`.
  - `GEMINI_ENABLED`.
- Model used:
  - `gemini-1.5-flash`.
- Uses:
  - Search spelling correction.
  - Product feature extraction utilities reference Gemini API key.
- Failure behavior:
  - Missing key disables AI and returns original query.
  - API/parsing failures return original query and low confidence.

### Sovrn / VigLink

- Package:
  - Local generated package `@api/viglink-developer-center`.
- Utilities/services:
  - `backend/src/utils/sovrn-affiliate.js`.
  - `backend/src/services/sovrn-recommendations.js`.
  - `backend/src/services/sovrn-price-comparison.js`.
- Variables:
  - `SOVRN_API_KEY`.
  - `SOVRN_SECRET_KEY`.
  - `SOVRN_BID_FLOOR`.
- Uses:
  - Affiliate URL wrapping during product upsert.
  - Product recommendations by product details.
  - Merchant price comparisons by product-name keywords.
- Market assumption:
  - Services use `usd_en`.
  - Fixed USD-to-INR conversion rate: `83`.

### Email Providers

- Packages:
  - `nodemailer`.
  - `resend`.
- Routes/services:
  - `backend/src/routes/contact.js`.
  - `backend/src/services/email-service.js`.
- Variables:
  - `EMAIL_USER`.
  - `EMAIL_PASS`.
  - `EMAIL_SERVICE`.
  - `EMAIL_FROM_NAME`.
  - `RESEND_API_KEY`.
  - Optional SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`.
  - Contact target: `CONTACT_TO_EMAIL`.
- Runtime behavior:
  - Contact route always builds a Gmail transporter.
  - Verification email service uses Resend in production and nodemailer locally.

### Google OAuth

- Packages:
  - `passport`.
  - `passport-google-oauth20`.
- Config location:
  - `backend/src/server.js`.
  - `backend/src/routes/auth.js`.
- Variables:
  - `GOOGLE_CLIENT_ID`.
  - `GOOGLE_CLIENT_SECRET`.
  - `GOOGLE_CALLBACK_URL`.
  - `FRONTEND_URL`.
  - `NEXT_PUBLIC_DASHBOARD_URL`.
- Scopes:
  - `profile`.
  - `email`.

### Notion

- Package: `@notionhq/client`.
- Route:
  - `frontend/landing-page/app/api/waitlist/route.ts`.
- Variables:
  - `NOTION_TOKEN`.
  - `NOTION_DATABASE_ID`.
- Behavior:
  - Validates email.
  - Queries database for duplicate `Email`.
  - Creates page with `Email` and `SubmittedAt`.

### Next.js/Vercel-Side Integration

- File: `frontend/landing-page/next.config.mjs`.
- Backend rewrite:
  - `/api/:path*` -> `${backendUrl}/api/:path*`.
  - `backendUrl` from `NEXT_PUBLIC_API_URL`, `API_URL`, or default.
- Build settings:
  - `reactStrictMode: true`.
  - `removeConsole` in production.
  - Image formats: WebP and AVIF.

## 9. Auth Flow

### Auth Components

- Route layer: `backend/src/routes/auth.js`.
- Auth service: `backend/src/services/auth-service.js`.
- Middleware: `backend/src/middleware/auth.js`.
- Credit refresh dependency: `backend/src/services/credits-service.js`.
- DB tables:
  - `users`.
  - `refresh_tokens`.
  - `login_attempts`.
  - `email_verification_otps`.

### Token Model

- Access token:
  - JWT signed with `JWT_SECRET`.
  - Payload: `userId`, `email`, `role`.
  - Expiry: 15 minutes.
  - Used in `Authorization: Bearer <token>`.
- Refresh token:
  - JWT signed with `JWT_REFRESH_SECRET`.
  - Payload: `userId`, random `tokenId`.
  - Expiry: 7 days.
  - Raw token returned to client.
  - SHA-256 hash stored in `refresh_tokens`.
- Refresh token verification:
  - JWT signature must be valid.
  - Hash must exist in DB.
  - Token row must not be revoked.
  - Token row must not be expired.
  - User must be active.

### Password Signup Flow

- Client calls `POST /api/auth/signup`.
- Route normalizes email.
- Route validates email and password complexity.
- Route checks existing user by email.
- New user path:
  - `authService.registerUser` hashes password with bcrypt salt rounds `12`.
  - User is inserted with default plan/credits.
- Existing unverified user path:
  - If verification required, creates/sends another OTP and returns `requiresVerification`.
- Verification-required branch:
  - `createEmailVerificationOtp` generates 6-digit OTP.
  - OTP hash = HMAC-SHA256 of normalized email and OTP using `JWT_SECRET`.
  - Previous active OTPs for user are marked consumed.
  - New OTP row is inserted with expiry.
  - Email service attempts delivery.
  - Development responses may include `devOtp`.
- Verification-not-required branch:
  - Access and refresh tokens are issued immediately.
  - Refresh token hash is stored.

### Email Verification Flow

- Client calls `POST /api/auth/verify-email`.
- Route validates email and OTP presence/format.
- Service loads user by normalized email.
- Service rejects:
  - Account not found.
  - Invalid OTP format.
  - Hash mismatch.
  - Expired OTP.
- Success transaction:
  - Marks OTP `consumed_at=NOW()`.
  - Updates user `email_verified=true`.
  - Commits transaction.
- Route issues access and refresh tokens after verification.

### Password Login Flow

- Client calls `POST /api/auth/login`.
- Route validates email/password presence.
- Route checks DB-backed failed-login rate limit:
  - Same email or IP.
  - Failed attempts within last 15 minutes.
  - Limit: 5.
- Service loads user by normalized email.
- Failure cases:
  - Missing user: records failed login.
  - Inactive user: returns account disabled.
  - Invalid password: records failed login.
  - Unverified email while verification required: creates/sends OTP and returns `requiresVerification`.
- Success:
  - Records successful login attempt.
  - Updates `last_login`.
  - Generates access token.
  - Generates refresh token.
  - Stores refresh token hash.
  - Returns public user object and tokens.

### Authenticated Request Flow

- Protected routes use `authenticate`.
- Middleware reads `Authorization` header.
- Missing or non-Bearer header returns `401`.
- Access token is verified with `JWT_SECRET`.
- Invalid/expired access token returns `401`.
- User is loaded by decoded `userId`.
- Missing or inactive user returns `401`.
- Credits are refreshed through `creditsService.maybeRefreshAndGetUser`.
- `req.user` is attached with:
  - identity fields.
  - role.
  - profile fields.
  - plan type.
  - credits.
  - email verification state.
  - timestamps.

### Optional Auth Flow

- Public routes that benefit from user context use `optionalAuth`.
- If no Bearer token exists, request continues anonymous.
- If token is valid and user active:
  - User is attached to `req.user`.
  - Credits are refreshed.
- Errors are swallowed; optional auth never blocks route execution.
- Used by:
  - `GET /api/products/search`.

### Refresh Flow

- Client calls `POST /api/auth/refresh` with refresh token.
- Route rejects missing token with `400`.
- Service verifies refresh JWT.
- Service verifies token hash in DB with non-revoked and non-expired checks.
- Service generates a new access token.
- Current implementation does not rotate refresh tokens on refresh.

### Logout Flow

- Single-device logout:
  - Client calls `POST /api/auth/logout` with Bearer access token and body refresh token.
  - Service hashes supplied refresh token.
  - Matching row is marked `revoked=true`, `revoked_at=NOW()`.
- All-device logout:
  - Client calls `POST /api/auth/logout-all`.
  - Service revokes all non-revoked refresh tokens for `req.user.id`.

### Google OAuth Flow

- Client navigates to `GET /api/auth/google`.
- Passport redirects to Google with `profile` and `email` scopes.
- Google returns to `GET /api/auth/google/callback`.
- Passport extracts:
  - `googleId`.
  - `email`.
  - display name.
  - profile picture.
- Service `loginOrRegisterGoogleUser`:
  - Finds user by `google_id`.
  - If absent, finds user by email and links `google_id`/avatar.
  - If no email match, inserts a new user with `email_verified=true`.
  - Updates avatar and last login on returning Google users.
  - Issues access and refresh tokens.
  - Stores refresh token hash.
- Route redirects to frontend dashboard callback with tokens in query string:
  - `${FRONTEND_URL}/auth/callback?token=<access>&refresh=<refresh>`.

### Authorization

- `authorize(...allowedRoles)` exists in `backend/src/middleware/auth.js`.
- It requires `req.user`.
- It returns `403` when `req.user.role` is not in allowed roles.
- No analyzed route currently uses `authorize`.

### Auth Risks And Edge Cases

- In-memory IP rate limiter is per process and resets on restart.
- DB-backed login-attempt limiter is by email/IP but only checked during password login.
- Refresh tokens are not rotated during refresh.
- Google OAuth callback sends tokens in URL query parameters.
- Runtime schema mutation in `auth-service.ensureGoogleColumns` alters users table outside migrations.
- `PATCH /api/auth/me/password` does not validate new password complexity.
- Landing page `/api/auth/register` proxy does not match backend signup path.
- `itemsService` is required after routes are declared but before requests execute; this works because handlers run after module initialization.
