# DropIQ

DropIQ is split into deployable frontend and backend roots:

```text
frontend/
  client/        Dashboard Next.js app for Vercel
  landing-page/  Landing page Next.js app for Vercel

backend/
  src/           Express API, jobs, services, and database code
  src/database/  Schema and migrations
  public/        Static backend fallback files
```

## Local Development
## Quick start (for new contributors)

Prerequisites:

- Node.js (recommend 16+)
- npm or yarn
- PostgreSQL for local development (if using the database features)

1) Install and run the backend API

```bash
cd backend
npm install
# create .env or set env vars (see backend/README.md)
npm run dev
```

2) Run the dashboard frontend

```bash
cd frontend/client
npm install
npm run dev -- -p 3000
```

3) Run the landing page

```bash
cd frontend/landing-page
npm install
npm run dev -- -p 3002
```

4) Run everything together (convenience)

From the repository root you can often run the combined script (starts services concurrently):

```bash
cd backend
npm run dev:all
```

Common scripts

- `npm run dev` : start a service in development mode with hot reload
- `npm start` : start production server
- `npm run build` : build frontend for production
- `npm run test` : run tests (where available)

Configuration & environment

- Backend database/migrations: `backend/src/database`
- Backend env vars: `DATABASE_URL` (or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- Frontend API URL: set `NEXT_PUBLIC_API_URL` for client builds

Where to find more details

- Backend docs and deployment notes: [backend/README.md](backend/README.md)
- Frontend app README: [frontend/README.md](frontend/README.md)
- Technical docs: [docs/technical-documentation.md](docs/technical-documentation.md)

If you're unsure, start by running the backend and the dashboard (`frontend/client`) on the ports above, then point the frontend at the backend using `NEXT_PUBLIC_API_URL`.

## Deployment

Render backend:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`
- Database/migration files live in `backend/src/database`
- Database env: use either `DATABASE_URL` or the separate `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` vars

Vercel dashboard:

- Root directory: `frontend/client`
- Build command: `npm run build`
- Environment variable: `NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com`

Vercel landing page:

- Root directory: `frontend/landing-page`
- Build command: `npm run build`
- Environment variables:
  - `NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com`
  - `NEXT_PUBLIC_DASHBOARD_URL=https://your-dashboard.vercel.app`


## Things to remember

you can run like cd frontend ; npm run dev to run all at once

