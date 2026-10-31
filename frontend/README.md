# Subflow frontend

The Sprint 1 frontend foundation is a responsive subscription-management workspace built with Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, and Recharts.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

## Routes

The dashboard is available at `/dashboard`. Shared-shell placeholder pages are available at `/customers`, `/products`, `/plans`, `/quotations`, `/subscriptions`, `/invoices`, `/payments`, `/discounts`, `/analytics`, and `/settings`.

Dashboard figures and activity are sample data stored in `src/data/mock-dashboard.ts`; they are not connected to the backend and do not represent live financial calculations. The backend remains authoritative for billing and financial values.

## Checks

Run the production build and linter from this directory:

```bash
npm run build
npm run lint
```
