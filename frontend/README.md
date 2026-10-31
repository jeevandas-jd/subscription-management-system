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

## Authentication status

The frontend provides `/login`, `/register`, `/forgot-password`, and `/reset-password`, plus role-aware workspace navigation and a customer-portal landing page. Its server-side adapter follows the documented `/api/v1/auth/` contract and keeps access and refresh JWTs in `HttpOnly`, `SameSite=Lax` cookies; browser JavaScript receives only the validated user profile. The adapter refreshes an expired access token once while checking the current user.

The Django `accounts` app currently has no authentication views, URL routes, or user-role model, so these screens cannot complete real sign-in, registration, or password-reset requests until the backend endpoints are implemented. The frontend returns an explicit unavailable-service error rather than simulating authentication. Logout clears the frontend cookies only; the contract does not define backend refresh-token invalidation. Frontend route gating and role-filtered navigation are usability controls, not authorization—the backend must enforce permissions and customer ownership for every protected API request.

Set `API_BASE_URL` for the Next.js server (for example `http://127.0.0.1:8000/api/v1` when running outside Docker). Docker Compose configures it to `http://backend:8000/api/v1` for container-to-container requests. `NEXT_PUBLIC_API_URL` remains available for any future browser-side integrations; auth requests use the server-only base URL.

## Checks

Run the production build and linter from this directory:

```bash
npm run build
npm run lint
```
