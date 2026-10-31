# Subflow frontend

The Sprint 1 frontend foundation is a responsive subscription-management workspace built with Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, and Recharts.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

## Routes

The dashboard is available at `/dashboard`. Customer management is available at `/customers`, `/customers/new`, `/customers/[id]`, and `/customers/[id]/edit`. Shared-shell placeholder pages for later sprints are available at `/products`, `/plans`, `/quotations`, `/subscriptions`, `/invoices`, `/payments`, `/discounts`, `/analytics`, and `/settings`.

Dashboard figures and activity are sample data stored in `src/data/mock-dashboard.ts`; they are not connected to the backend and do not represent live financial calculations. The backend remains authoritative for billing and financial values.

Customer records are sample data managed by `src/lib/customers/customer-service.ts` and persisted in this browser's `localStorage` under `subflow.customers.v1`. Changes survive navigation and reloads in the same browser, but are not shared across browsers or devices and are not sent to the backend. Removing that key restores the initial sample customer list. Invalid or unavailable browser storage is reported in the customer interface instead of being silently overwritten.

## Checks

Run the production build and linter from this directory:

```bash
npm run build
npm run lint
```
