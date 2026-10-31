# Subflow frontend

The Sprint 1 frontend foundation is a responsive subscription-management workspace built with Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, and Recharts.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

## Routes

The dashboard is available at `/dashboard`. Customer management is available at `/customers`, `/customers/new`, `/customers/[id]`, and `/customers/[id]/edit`. Product catalogue routes are `/products`, `/products/new`, `/products/[id]`, and `/products/[id]/edit`; product details include variant listing and creation. Plan routes are `/plans`, `/plans/new`, `/plans/[id]`, and `/plans/[id]/edit`. Quotation routes are `/quotations`, `/quotations/new`, `/quotations/[id]`, and `/quotations/[id]/edit`. Subscription routes are `/subscriptions`, `/subscriptions/new`, `/subscriptions/[id]`, and `/subscriptions/[id]/edit`. `/invoices`, `/payments`, `/discounts`, `/analytics`, and `/settings` remain placeholders.

Dashboard figures and activity are sample data stored in `src/data/mock-dashboard.ts`; they are not connected to the backend and do not represent live financial calculations. The backend remains authoritative for billing and financial values.

Customer records are sample data managed by `src/lib/customers/customer-service.ts` and persisted in this browser's `localStorage` under `subflow.customers.v1`. Changes survive navigation and reloads in the same browser, but are not shared across browsers or devices and are not sent to the backend. Removing that key restores the initial sample customer list. Invalid or unavailable browser storage is reported in the customer interface instead of being silently overwritten.

Products, variants, and subscription plans currently use the same demo-only approach. Their services are isolated in `src/lib/products/` and `src/lib/plans/`, with initial records in `src/data/mock-products.ts` and `src/data/mock-plans.ts`. Data is stored in this browser under `subflow.products.v1`, `subflow.product-variants.v1`, and `subflow.subscription-plans.v1`; clearing an individual key restores that resource's sample records. Catalogue pages display a demo-data notice and never claim that a change reached the backend.

The documented product, variant, and plan endpoints are `GET/POST /api/v1/products/`, `GET/PATCH/DELETE /api/v1/products/{id}/`, `GET/POST /api/v1/products/{id}/variants/`, `GET/POST /api/v1/plans/`, and `GET/PATCH/DELETE /api/v1/plans/{id}/`. These are not integrated yet: the Django product and plan models/views are stubs and `backend/config/urls.py` does not expose API routes. The frontend therefore does not invent a browser API client or pretend to enforce backend deletion constraints. Once connected, the backend must remain authoritative for delete restrictions and all role permissions.

Catalogue permissions follow the API contract in the UI: Admin can view and manage products, variants, and plans; Staff can view them but cannot create, edit, or delete; Customers cannot access either module. These checks are only frontend UX controls. The backend must enforce the same permissions.

## Quotations and subscriptions

The Sprint 5 quotation and subscription screens use browser-only sample data; they do not call the Django API. Records are stored under `subflow.quotations.v1` and `subflow.subscriptions.v1` in `localStorage`. Removing either key restores that resource's sample records. Customer links use the existing mock customer string IDs and are resolved to the signed-in customer by email; these local identifiers do not represent the integer IDs in the API contract.

Quotation flows cover listing, filtering, sorting, draft creation/editing, detail viewing, and conversion of an accepted, unexpired quotation. The documented create payload has no unit-price, tax, or discount inputs, so its line prices and totals are explicitly demo estimates. The UI does not add unsupported send, accept, reject, or expire actions.

Subscription flows cover listing, filtering, standalone draft creation/editing, details, and confirmation, pause, resume, renewal, and close confirmations. The API contract names these actions and statuses but does not define allowed transitions or plan restrictions. The local demo therefore gates these actions using status and plan settings and does not present those assumptions as backend rules. Because a subscription has one plan while quotation lines can reference multiple plans, the demo rejects conversion when a quotation contains mixed plans rather than silently dropping line-level plan references. Recurring amounts are calculated from line snapshots, not from an invoicing or billing engine. Converting a quotation updates both local resources; browser storage does not provide a multi-key transaction.

Customers can view only their own quotation and subscription records in the portal and list/detail pages. This is a frontend visibility control only; server-side ownership and role enforcement are required when the documented API endpoints are implemented. Invoices and payments remain outside this milestone.

## Authentication status

The frontend provides `/login`, `/register`, `/forgot-password`, and `/reset-password`, plus role-aware workspace navigation and a customer-portal landing page. Its server-side adapter follows the documented `/api/v1/auth/` contract and keeps access and refresh JWTs in `HttpOnly`, `SameSite=Lax` cookies; browser JavaScript receives only the validated user profile. The adapter refreshes an expired access token once while checking the current user.

The Django `accounts` app currently has no authentication views, URL routes, or user-role model, so these screens cannot complete real sign-in, registration, or password-reset requests until the backend endpoints are implemented. The frontend returns an explicit unavailable-service error rather than simulating authentication. Logout clears the frontend cookies only; the contract does not define backend refresh-token invalidation. Frontend route gating and role-filtered navigation are usability controls, not authorization—the backend must enforce permissions and customer ownership for every protected API request.

The integrated auth adapter's paths, HTTP methods, payload names, and response fields were checked against `doc/api_contract.md`: registration and login use `POST` with the documented fields; the session check uses `GET auth/me/` with `Authorization: Bearer <access>` and refresh uses `POST auth/token/refresh/` with `{ "refresh": ... }`; password reset and confirmation use their documented `POST` paths and payload names. Backend role values (`admin`, `staff`, `customer`) are normalized without changing their meaning. The documented admin staff-account endpoint (`POST auth/staff/`) is not integrated into a frontend workflow, and the Django URL configuration currently exposes none of these auth endpoints.

Set `API_BASE_URL` for the Next.js server (for example `http://127.0.0.1:8000/api/v1` when running outside Docker). Docker Compose configures it to `http://backend:8000/api/v1` for container-to-container requests. `NEXT_PUBLIC_API_URL` remains available for any future browser-side integrations; auth requests use the server-only base URL.

## Checks

Run the production build and linter from this directory:

```bash
npm run build
npm run lint
```
