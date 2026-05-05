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

Run the backend:

```bash
cd backend
npm install
npm run dev
```

Run the dashboard frontend:

```bash
cd frontend/client
npm install
npm run dev -- -p 3000
```

Run the landing page:

```bash
cd frontend/landing-page
npm install
npm run dev -- -p 3002
```

You can also run all three from `backend`:

```bash
npm run dev:all
```

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
