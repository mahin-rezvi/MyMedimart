# Medimart

Medimart is a Next.js ecommerce storefront with customer auth, account pages,
cart and checkout flows, admin management screens, and Neon Postgres-backed API
routes.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database Setup

Use Neon Postgres for Vercel. It has a free plan, a Vercel Marketplace
integration, and a serverless driver that fits Vercel Functions well.

1. Copy `.env.local.example` to `.env.local` if needed.
2. Create a free Neon database from the Vercel Marketplace.
3. Set `DATABASE_URL` locally and in Vercel project environment variables.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
```

4. Apply the schema and verify the connection:

```bash
npm run db:migrate
npm run db:test
```

The app also exposes a runtime health check at `http://localhost:3000/api/db/test`.

## Checks

```bash
npm run lint
npm run build
```
