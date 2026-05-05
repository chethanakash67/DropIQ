# DropIQ Backend

This is the Render-ready backend root.

```bash
npm install
npm run dev
```

Render settings:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`
- Database env: use either `DATABASE_URL` or the separate `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` vars

Database files are in `src/database`, including `schema.sql`, `migrate.js`, and numbered migrations.

Supabase sync:

```bash
npm run sync:supabase
```

The sync pulls matching Supabase rows into local Postgres, then pushes local rows back to Supabase with primary-key upserts.
