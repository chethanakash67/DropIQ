# DropIQ Frontend

This folder contains the two Next.js frontend apps:

- `client`: dashboard app, usually deployed as the main Vercel app
- `landing-page`: marketing/waitlist app, deployable as a second Vercel app

Both apps proxy `/api/*` to `NEXT_PUBLIC_API_URL`. Set that variable on Vercel to your Render backend URL.

## Local Development

From this `frontend` folder:

- `npm run dev` starts the backend, landing page, and dashboard app together
- Landing page: `http://localhost:3002`
- Dashboard/login: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- `npm run dev:client` starts the dashboard app at `http://localhost:3000`
- `npm run dev:landing` starts only the landing page at `http://localhost:3002`
