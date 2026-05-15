# DropIQ Technical Documentation

## 1. Project Overview & Architecture

### Source Scope

- Source root analyzed: `D:\DropIQ_Main\diq_code`.
- `.gitignore` honored for code analysis.
- Ignored code/data areas not used for this section: `node_modules/`, `.env` values, `supabase/`, `scratch/`, `test-files/`, root `client/`, root `Landing_page/`, generated/build artifacts, binaries, archives, spreadsheets, secret JSON files.
- `.env` was read only for variable names to identify runtime boundaries; values were not read or documented.
- Active codebase surface from non-ignored source:
  - `backend/`: Express API, PostgreSQL access, ingestion jobs, schedulers, auth, product search, D_IQ scoring.
  - `frontend/landing-page/`: Next.js landing/marketing app, waitlist API, auth proxy routes, dashboard redirects.
  - `frontend/package.json`: wrapper scripts that delegate to ignored `frontend/client` and non-ignored `frontend/landing-page`.
  - `render.yaml`: Render deployment definition for backend service only.

### System Purpose

- DropIQ is a product search and recommendation platform for consumer products, mainly audio categories present in code: `headphones`, `earbuds`, `neckbands`, `wired_earphones`, `robot_vacuums`.
- Backend responsibilities:
  - Search products across retailer-specific PostgreSQL tables.
  - Rank products using D_IQ scoring from questionnaire answers and product feature fields.
  - Manage users, JWT auth, Google OAuth, refresh tokens, email verification OTPs, credits, bag, cart, profile, and search history.
  - Ingest product data from Apify, Browse.ai, Google Sheets, CSV/local sources, and store-specific jobs.
  - Generate affiliate links and fetch/cache recommendation or price-comparison data.
  - Trigger and monitor offline-store sync through a secured webhook.
  - Send contact-form emails.
- Frontend landing-page responsibilities:
  - Render public marketing pages and static content.
  - Redirect `/login` and `/signup` to dashboard URLs.
  - Save waitlist emails to Notion.
  - Proxy selected auth API calls to a backend URL.
- Dashboard/client app is referenced by scripts and environment variables, but the tracked/analyzed dashboard implementation is not available because `client/` is ignored.

### Runtime Architecture

- Main backend entrypoint: `backend/src/server.js`.
- Backend runtime:
  - Loads environment from root `.env`.
  - Starts an Express server on `PORT` or `3001`.
  - Initializes Passport Google OAuth strategy.
  - Enables CORS for local ports `3000`-`3004`, deployed frontend URL, and dashboard URL.
  - Parses JSON and URL-encoded bodies.
  - Serves static files from `backend/public`.
  - Mounts API routers:
    - `/api/auth`
    - `/api/products`
    - `/api/diq`
    - `/api/webhooks`
    - `/api/contact`
  - Exposes `/api/health` for deployment health checks.
  - Starts background schedulers unless `DISABLE_SCHEDULERS=true`.
- Backend scheduled work started from `server.js`:
  - `scheduler/monthly-ingestion`: monthly product ingestion on day 30 at `01:00` Asia/Kolkata.
  - `scheduler/samsung-ingestion`: Samsung-specific ingestion scheduler.
  - `scheduler/offline-store-sync`: Google Sheets/offline-store sync scheduler.
- Database runtime:
  - `backend/src/database/db.js` creates a shared `pg.Pool`.
  - Supports either `DATABASE_URL`-style connection strings or discrete `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
  - Hosted detection uses `NODE_ENV=production`, `RENDER`, or `RENDER_EXTERNAL_URL`.
  - Hosted connections force SSL and IPv4-first DNS.
  - Supabase direct hosts matching `db.<ref>.supabase.co` are rewritten to the Supabase pooler host for hosted deployments because Render cannot rely on IPv6 outbound connectivity.
- Frontend landing-page runtime:
  - Main app path: `frontend/landing-page`.
  - Framework: Next.js App Router.
  - Main page: `frontend/landing-page/app/page.tsx`.
  - Public page composition: navbar, hero, how-it-works, search demo, social proof, team, demo video, pricing teaser, FAQ, final CTA, footer.
  - Heavy landing sections use `next/dynamic` with SSR enabled to reduce initial client payload while keeping server-rendered content.
  - `/login` and `/signup` route handlers redirect to `NEXT_PUBLIC_DASHBOARD_URL` or a production fallback.
  - `/api/waitlist` writes emails to Notion after duplicate checking.
  - `/api/auth/login` and `/api/auth/register` proxy requests to `BACKEND_URL`.

### Backend Layering

- HTTP layer:
  - `backend/src/routes/*.js` contains request validation, response shape, route-level auth/credit checks, and integration orchestration.
- Middleware layer:
  - `backend/src/middleware/auth.js` validates Bearer JWT access tokens.
  - `authenticate` rejects unauthenticated requests.
  - `optionalAuth` attaches `req.user` when a valid token exists but allows anonymous requests.
  - User credits are refreshed during auth middleware execution.
- Service layer:
  - `auth-service.js`: password hashing, login, signup, Google OAuth account linking, JWT generation, refresh-token persistence/revocation, OTP verification, profile updates.
  - `credits-service.js`: plan normalization, 12-hour credit refresh, transactional credit consumption, short duplicate-charge guard.
  - `diq-scoring-service.js`: answer-to-weight mapping, product filtering, feature/value/D_IQ score calculation, online/offline product ranking.
  - `email-service.js`: outbound verification/contact email support.
  - `gemini-service.js`: AI-assisted search correction and product feature extraction support.
  - `sovrn-recommendations.js` and `sovrn-price-comparison.js`: affiliate recommendation and comparison enrichment.
  - `apify-client.js`, `browseai-client.js`, `google-sheets-service.js`: ingestion integration clients.
- Repository layer:
  - `product-repository.js` owns retailer-specific product upserts, product search, search history, popular searches, and dynamic suggestions.
  - `offline-store-repository.js` owns offline-store persistence concerns.
- Job layer:
  - `backend/src/jobs/*.js` contains one-off and scheduled ingestion/sync workflows.
  - Jobs call integration clients and repositories instead of exposing HTTP endpoints directly.

### Data Architecture

- Primary database: PostgreSQL.
- Product storage model:
  - Uses one table per retailer/source with names ending in `_products`.
  - Known online product tables from code and migrations include `amazon_products`, `flipkart_products`, `samsung_products`, `sony_products`, `croma_products`, `vijay_sales_products`, `tatacliq_products`, `myntra_products`, `zebronics_products`, `boat_products`, `reliance_digital_products`, `oneplus_products`.
  - Product tables share a common operational shape: product name, brand/source identifier, category, INR price, rating/reviews, descriptions/specifications, media URL, product URL, affiliate URL, availability status, timestamps, soft-delete flag.
  - Later product tables include D_IQ feature columns such as `review_score`, `brand_score`, `has_anc`, `battery_hours`, `has_fast_charge`, `mic_quality_score`, `has_app_support`, `color`, `design_style`, `classified_tag`.
- Dynamic table discovery:
  - Product search endpoints query `information_schema.tables` for `public` tables matching `%_products`.
  - Reason: adding a new retailer table can make it visible to generic search/index/retailer endpoints without hardcoding every route.
- Hardcoded ranking scope:
  - `diq-scoring-service.js` ranks online products from `amazon_products`, `flipkart_products`, `samsung_products`, and `sony_products`.
  - Offline products are added from tables registered in `offline_stores`.
  - Reason in implementation: D_IQ ranking requires a predictable feature column set; unknown retailer tables may not have complete scoring fields.
- Offline-store architecture:
  - `offline_stores` maps a store registration to a physical store identity and generated table name.
  - Offline product rows are queried from the registered store table and normalized into the same recommendation response shape with default feature values.
  - Offline products carry a disclaimer because feature fields are approximated or missing.
- User/auth data:
  - `users` stores identity, role, plan, credits, profile fields, Google OAuth columns, email verification state, and timestamps.
  - `refresh_tokens` stores hashed refresh tokens for revocation and expiry checks.
  - `login_attempts` supports DB-backed login rate limiting.
  - `email_verification_otps` stores hashed OTP codes with expiry and consumption state.
  - `bag_items`, `cart_items`, and `search_history` attach user-specific product and search state.

### Request/Data Flow

- Product search flow:
  - Client calls `GET /api/products/search`.
  - `optionalAuth` attaches user context when Bearer token is valid.
  - If `chargeCredits=true` and query is non-empty, backend requires auth and consumes `3` credits unless the same user searched the exact query in the recent window.
  - Route builds filters and calls `ProductRepository.searchProducts`.
  - Repository applies spelling correction logic, brand/category keyword detection, price filters, retailer filters, sorting, and pagination across product data.
  - Authenticated searches are saved to `search_history` asynchronously.
- D_IQ recommendation flow:
  - Client calls `POST /api/diq/recommendations`.
  - `authenticate` requires a valid access token.
  - Backend consumes `7` credits.
  - `diq-scoring-service` maps questionnaire answers to weights and filters.
  - Service loads online product rows plus registered offline-store rows.
  - Products are filtered, scored, ranked, and returned with D_IQ score, rating, score breakdown, and lock flags for free-plan users.
- Auth flow:
  - Password auth uses `/api/auth/signup`, `/api/auth/verify-email`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`.
  - Passwords are bcrypt-hashed with 12 salt rounds.
  - Access JWT expiry is `15m`; refresh JWT expiry is `7d`.
  - Refresh tokens are hashed before database storage.
  - Google OAuth starts at `/api/auth/google` and redirects through `/api/auth/google/callback`.
  - Google users are linked by `google_id` or existing email and marked email-verified.
- Offline-store sync flow:
  - Scheduler runs sync repeatedly.
  - Webhook `POST /api/webhooks/form-store-sync` can trigger sync manually.
  - Webhook requires `STORE_SYNC_WEBHOOK_SECRET` through `x-sync-secret`.
  - Duplicate webhook events are ignored for 10 minutes using an in-memory event-id cache.

### Deployment Architecture

- `render.yaml` defines one Render web service:
  - Service name: `dropiq-backend`.
  - Root directory: `backend`.
  - Build command: `npm ci`.
  - Start command: `npm start`.
  - Health check path: `/api/health`.
- Frontend landing-page deployment is not defined in `render.yaml`.
- Backend code contains production frontend fallbacks for:
  - API CORS: `https://dropiq-nine.vercel.app`.
  - Google OAuth callback fallback: `https://dropiq-t62y.onrender.com/api/auth/google/callback`.
  - Auth redirect frontend URL fallback: `https://dropiq-nine.vercel.app`.
- Landing-page dashboard redirect fallback points to:
  - `https://dropiq-nine.vercel.app` for dashboard URL.
  - `https://dropiq-t62y.onrender.com/login` and `/signup` for route-level fallback redirects.

### Critical Architecture Constraints

- The backend is not stateless:
  - In-memory duplicate guards exist for auth route rate limiting, webhook event IDs, and duplicate credit deductions.
  - These guards do not coordinate across multiple backend instances.
- `server.js` starts schedulers inside the web process.
  - On horizontal scaling, ingestion/sync jobs would run once per instance unless disabled or externalized.
- Product table names are interpolated into SQL only after controlled discovery or validation in several paths.
  - New dynamic-table code must keep table names validated against known/discovered database metadata before interpolation.
- Product search and product details support dynamic retailer tables.
  - D_IQ scoring does not fully support every `*_products` table unless added to the hardcoded online table list or normalized through offline-store logic.
- The tracked landing page proxies `/api/auth/register` to backend `/api/auth/register`, while the backend implemented password signup route is `/api/auth/signup`.
  - This is an architecture-facing route-contract mismatch in the analyzed source.

## 2. Tech Stack & Key Decisions

### Backend Runtime

- Runtime: Node.js.
- Backend framework: Express `4.18.2`.
- Module format: CommonJS (`require`, `module.exports`) across backend source.
- Entrypoint: `backend/src/server.js`.
- Local dev process: `nodemon src/server.js`.
- Production process: `node src/server.js`.
- Why this matters:
  - New backend files should use CommonJS unless the backend package is migrated.
  - Route, service, job, and repository modules are imported synchronously with `require`.
  - Background schedulers start as side effects when required by `server.js`.

### Backend HTTP Stack

- `express`: routing, middleware, body parsing, static file serving.
- `cors`: explicit origin allowlist for local frontend ports, Vercel dashboard URL, and configured frontend/dashboard URLs.
- `passport` + `passport-google-oauth20`: Google OAuth strategy and callback handling.
- `express.json()` and `express.urlencoded({ extended: true })`: body parsing in `server.js`.
- Static assets served from `backend/public`.
- API route prefix convention:
  - `/api/auth`
  - `/api/products`
  - `/api/diq`
  - `/api/webhooks`
  - `/api/contact`

### Database Stack

- Database: PostgreSQL.
- Node driver: `pg`.
- Pool module: `backend/src/database/db.js`.
- Connection modes:
  - Preferred hosted mode: `DATABASE_URL`, `RENDER_DATABASE_URL`, or `POSTGRES_URL`.
  - Discrete fallback: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- Hosted SSL behavior:
  - SSL is enabled when hosted, `DB_SSL=true`, `PGSSLMODE=require`, or connection string contains `sslmode=require`.
  - `rejectUnauthorized: false` is used for hosted SSL compatibility.
- Supabase/Render decision:
  - `dns.setDefaultResultOrder('ipv4first')` is set before creating the pool.
  - Hosted Supabase direct host URLs are rewritten from `db.<ref>.supabase.co:5432` to `aws-0-ap-south-1.pooler.supabase.com:6543`.
  - Reason: Render cannot rely on IPv6 outbound connectivity, while Supabase direct DB hosts can be IPv6-only.

### Database Change Management

- Base schema file: `backend/src/database/schema.sql`.
- Incremental migrations: `backend/src/database/migrations/*.sql`.
- Migration runner: `backend/src/database/migrate.js`.
- Migration script: `npm run migrate` from `backend`.
- Product table strategy:
  - Separate retailer/source tables instead of a single products table.
  - Generic endpoints discover `*_products` tables dynamically.
  - Some scoring logic still hardcodes table names where feature availability must be predictable.
- Why this matters:
  - Adding a retailer usually requires a migration, repository upsert logic, and ingestion job.
  - Search/index endpoints may see a new `*_products` table automatically.
  - D_IQ ranking needs explicit review because it does not automatically score all discovered product tables.

### Auth & Security Stack

- Password hashing: `bcrypt` with 12 salt rounds.
- Access tokens: `jsonwebtoken`, 15-minute expiry.
- Refresh tokens: `jsonwebtoken`, 7-day expiry.
- Refresh-token persistence:
  - Raw refresh token is returned to the client.
  - SHA-256 hash of refresh token is stored in `refresh_tokens`.
  - Logout revokes by token hash.
- Google OAuth:
  - Backend configures Passport Google strategy in `server.js`.
  - Callback URL comes from `GOOGLE_CALLBACK_URL` or environment-specific fallback.
  - Existing accounts are linked by email when Google login is first used.
- Email verification:
  - OTP codes are HMAC-SHA256 hashed before database storage.
  - OTP expiry defaults to 10 minutes via `EMAIL_OTP_EXPIRY_MINUTES`.
- Credit gate:
  - Search with `chargeCredits=true`: 3 credits.
  - D_IQ recommendations: 7 credits.
  - Credits refresh every 12 hours by plan.

### Ingestion & Scheduling Stack

- Scheduler library: `node-cron`.
- Scheduler files: `backend/src/scheduler/*.js`.
- Job files: `backend/src/jobs/*.js`.
- Integration clients:
  - Apify client: `backend/src/services/apify-client.js`.
  - Browse.ai client: `backend/src/services/browseai-client.js`.
  - Google Sheets service: `backend/src/services/google-sheets-service.js`.
- CSV parsing: `csv-parse`.
- Excel export/import support: `xlsx`.
- Scheduling decision:
  - Schedulers are started inside the web server process.
  - `DISABLE_SCHEDULERS=true` disables scheduler startup from `server.js`.
  - Reason to know: multi-instance deployment can duplicate scheduled ingestion unless only one instance runs schedulers.

### AI & Recommendation Integrations

- Gemini packages:
  - `@google/genai`
  - `@google/generative-ai`
- Gemini usage in code:
  - Search spelling correction fallback when `GEMINI_ENABLED` is not `false`.
  - Product feature extraction support via service utilities.
- Sovrn/VigLink:
  - Local generated package dependency: `@api/viglink-developer-center`.
  - Utility: `backend/src/utils/sovrn-affiliate.js`.
  - Services: `sovrn-recommendations.js`, `sovrn-price-comparison.js`.
  - Product repository generates affiliate URLs during product upserts.
- Reasoning in implementation:
  - Fast hardcoded search correction handles common product/brand typos before calling Gemini.
  - AI correction is gated by heuristics to reduce latency/cost on normal queries.
  - Recommendation and price-comparison results are cached back into retailer product tables.

### Email Stack

- `nodemailer`: SMTP/Gmail contact and verification email path.
- `resend`: listed backend dependency and used by email service paths where configured.
- Contact route:
  - `backend/src/routes/contact.js`.
  - Requires `EMAIL_USER` and `EMAIL_PASS` for Gmail transporter.
  - Sanitizes contact message fields before HTML email rendering.

### Frontend Landing-Page Stack

- Framework: Next.js `15.2.4`.
- React: `19`.
- Language: TypeScript.
- App model: Next.js App Router under `frontend/landing-page/app`.
- Styling:
  - Tailwind CSS `4.1.9`.
  - Global styles in `app/globals.css` and `styles/globals.css`.
  - `tailwind-merge`, `clsx`, `class-variance-authority` for class composition.
- UI primitives:
  - Radix UI packages under `components/ui`.
  - `lucide-react` for icons.
  - `sonner` and local toast components for notifications.
- Forms and validation:
  - `react-hook-form`.
  - `@hookform/resolvers`.
  - `zod`.
- Data/visual libraries:
  - `recharts`.
  - `fuse.js`.
  - `xlsx`.
  - `web-vitals`.
- Theme support:
  - `next-themes`.
  - Local `theme-provider.tsx` and `theme-toggle.tsx`.

### Frontend Integration Decisions

- Landing page does not own the dashboard experience.
- Dashboard target is resolved by `frontend/landing-page/lib/dashboard-url.ts`.
- `/login` and `/signup` are redirect route handlers instead of local pages.
- `/api/waitlist` writes to Notion with duplicate checking.
- `/api/auth/login` and `/api/auth/register` are backend proxy route handlers.
- Important mismatch:
  - Landing page proxy calls backend `/api/auth/register`.
  - Backend password registration route is `/api/auth/signup`.
  - Any future auth UI must align route names before relying on this proxy.

### Deployment Stack

- Backend deployment target: Render web service.
- Deployment config: root `render.yaml`.
- Render root directory: `backend`.
- Backend build: `npm ci`.
- Backend start: `npm start`.
- Backend health check: `/api/health`.
- Landing-page deployment config:
  - `frontend/landing-page/vercel.json` exists.
  - Root `render.yaml` does not deploy landing page.
- Operational decision:
  - Backend and frontend are deployable as separate services with environment-variable-based URLs.

### Development Tooling

- Backend:
  - `nodemon` for reload in development.
  - `concurrently` for combined backend/landing/client dev startup.
  - `commander` for CLI-style scripts.
- Frontend landing page:
  - `next dev`.
  - Type checking through `tsc --noEmit`, exposed as `npm run lint`.
- Root frontend wrapper:
  - `frontend/package.json` delegates scripts to `frontend/client` and `frontend/landing-page`.
  - `frontend/client` is ignored by `.gitignore`, so wrapper scripts may reference local-only source not included in tracked analysis.

## 3. Folder Structure & Conventions

### Repository Root

- `backend/`
  - Primary server application.
  - Contains Express routes, services, repositories, database scripts, schedulers, jobs, and static fallback files.
- `frontend/`
  - Frontend workspace wrapper.
  - Contains `landing-page/` tracked source.
  - References `client/`, but `client/` is ignored by `.gitignore`.
- `.api/`
  - Contains generated/local API package files for VigLink/Sovrn dependency.
- `.env`
  - Ignored secrets/config file.
  - Only variable names should be documented or inspected.
- `.gitignore`
  - Defines analysis exclusions for generated files, dependencies, local-only apps, secret JSON files, large media/data files, and Supabase artifacts.
- `render.yaml`
  - Backend Render service definition.
- `start-all.bat`
  - Windows helper script for starting multiple local services.
- `Readme.md`, `Information_Doc.md`, `instructions_for_supabase.md`
  - Existing local docs/reference files; not source-of-truth over executable code.
- `dump.sql`, `loader.sql`
  - Database dump/loader artifacts at root.

### Backend Structure

- `backend/src/server.js`
  - Main Express application.
  - Owns middleware registration, CORS, Passport setup, route mounting, health check, error handler, scheduler startup.
- `backend/src/routes/`
  - HTTP route modules.
  - Convention: each file exports an Express router.
  - Current routers:
    - `auth.js`: signup, login, OTP verification, JWT refresh/logout, Google OAuth callback, profile, bag/cart, plan upgrade.
    - `products.js`: search, search history, retailers, search index, suggestions, product detail, Sovrn recommendations, price comparisons.
    - `diq.js`: D_IQ questions, recommendation scoring, score calculation, test endpoint.
    - `webhooks.js`: secured offline-store sync trigger/status.
    - `contact.js`: contact-form email submission.
- `backend/src/middleware/`
  - Cross-route middleware.
  - `auth.js` exports `authenticate`, `authorize`, and `optionalAuth`.
- `backend/src/services/`
  - Business logic and external integration clients.
  - Convention: services encapsulate logic that routes should orchestrate but not implement inline.
  - Current service categories:
    - Auth/session: `auth-service.js`, `credits-service.js`, `user-items-service.js`.
    - Scoring/AI: `diq-scoring-service.js`, `gemini-service.js`, `image-analyzer.js`.
    - External clients: `apify-client.js`, `browseai-client.js`, `google-sheets-service.js`.
    - Affiliate/comparison: `sovrn-recommendations.js`, `sovrn-price-comparison.js`.
    - Email: `email-service.js`.
- `backend/src/repositories/`
  - Database access abstractions for product and offline-store persistence.
  - `product-repository.js` contains retailer-specific upsert/search logic.
  - `offline-store-repository.js` contains offline-store persistence logic.
- `backend/src/database/`
  - DB connection, base schema, migration runner, and SQL migrations.
  - `db.js`: shared PostgreSQL pool.
  - `schema.sql`: initial schema.
  - `migrate.js`: migration runner.
  - `migrations/`: incremental SQL files, named with numeric prefixes.
- `backend/src/jobs/`
  - Executable ingestion/sync tasks.
  - Convention: job files are runnable through npm scripts or required by schedulers.
  - Examples:
    - `ingest-apify-data.js`
    - `ingest-all-stores.js`
    - `ingest-browseai-stores.js`
    - `ingest-croma-full.js`
    - `ingest-myntra-apify.js`
    - `sync-offline-stores.js`
- `backend/src/scheduler/`
  - Recurring job orchestration.
  - Uses `node-cron`.
  - Current scheduler files:
    - `monthly-ingestion.js`
    - `samsung-ingestion.js`
    - `offline-store-sync.js`
    - `brand-stores-ingestion.js`
- `backend/src/config/`
  - Static scoring/config data.
  - `diq-questions.js`: D_IQ questionnaire definitions and category question selection.
  - `category-medians.json`: median prices used in D_IQ score normalization.
- `backend/src/utils/`
  - One-off helpers and operational utilities.
  - Includes affiliate URL helper, exports, Supabase sync, store fetches, feature extraction.
- `backend/public/`
  - Static browser files served by Express.
  - Contains `index.html`, `app.js`, `cart-functions.js`.
- `backend/docs/`
  - Existing backend reference docs.
  - Should be treated as secondary to executable source when conflicts exist.

### Backend Naming Conventions

- Route files use plural/domain names: `products.js`, `webhooks.js`.
- Service files use `*-service.js` for business services.
- Repository files use `*-repository.js` for persistence abstractions.
- Scheduler files use domain names and live under `scheduler/`.
- Job files use imperative prefixes:
  - `ingest-*` for product data ingestion.
  - `sync-*` for synchronization tasks.
  - `fetch-*` for data retrieval utilities.
- Migration files use numeric prefixes:
  - Example: `003_auth_system.sql`.
  - Duplicate numeric prefix exists for `011_*` migrations; future migrations should use a new unique prefix to avoid ordering ambiguity.
- Product table names use lowercase snake_case and end in `_products`.
- Retailer display names are derived from table names unless overridden in route constants.

### Backend Code Conventions

- Backend source uses CommonJS imports/exports.
- Route handlers use `try/catch` and return JSON response objects with `success` flags.
- Errors are logged with `console.error`; route responses usually include generic `error` plus optional `message` or `details`.
- Database queries are mostly raw SQL through the shared `db.query`.
- Dynamic table names are interpolated only after validation/discovery patterns.
- User-specific protected routes attach user data to `req.user`.
- Credits are checked in route handlers before expensive/restricted operations.
- Long-running ingestion logic is kept outside route modules in `jobs/` or services.

### Frontend Structure

- `frontend/package.json`
  - Workspace-like script delegator.
  - Uses `npm --prefix` to run scripts in `backend`, `client`, and `landing-page`.
- `frontend/landing-page/`
  - Tracked public landing application.
  - Next.js App Router project.
- `frontend/landing-page/app/`
  - Route tree.
  - Important routes:
    - `page.tsx`: landing page composition.
    - `layout.tsx`: root layout.
    - `about/page.tsx`, `contact/page.tsx`, `privacy/page.tsx`, `terms/page.tsx`: static/public pages.
    - `login/route.ts`, `signup/route.ts`: redirect route handlers.
    - `auth/callback/route.ts`: auth callback route.
    - `api/waitlist/route.ts`: Notion waitlist API.
    - `api/auth/*/route.ts`: auth-related proxy/API routes.
- `frontend/landing-page/components/`
  - Page sections and shared UI.
  - Landing sections use descriptive names: `hero.tsx`, `how-it-works.tsx`, `why-different.tsx`, `pricing-teaser.tsx`, `faq.tsx`.
  - `components/ui/` contains Radix/shadcn-style primitives.
- `frontend/landing-page/hooks/`
  - Client hooks such as mobile/toast/search helpers.
- `frontend/landing-page/lib/`
  - Shared utility modules.
  - `dashboard-url.ts`: dashboard URL resolution and path joining.
  - `utils.ts`: shared utility functions.
- `frontend/landing-page/public/`
  - Static assets, images, placeholders, favicon, videos.
- `frontend/landing-page/styles/`
  - Additional global CSS file.

### Frontend Naming Conventions

- React component files use kebab-case filenames.
- Component exports generally use PascalCase inside files.
- Next.js route files follow App Router conventions:
  - `page.tsx` for pages.
  - `layout.tsx` for layouts.
  - `route.ts` for route handlers.
- UI primitive files live under `components/ui/` and mirror primitive names.
- Client components begin with `"use client"` where hooks/browser behavior are required.
- Dynamic imports are used for heavier landing sections while keeping SSR enabled.

### Documentation Folder Convention

- New generated technical documentation is stored in `docs/` at code root.
- Current generated file:
  - `docs/technical-documentation.md`.
- Append new approved sections to the same file to keep a single handoff document.
- Do not use ignored/reference folders as primary documentation output unless explicitly requested.
