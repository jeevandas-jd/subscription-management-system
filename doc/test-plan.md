# Test Plan

## 1. Purpose
Define how the Subscription Management System is tested so that every sprint release (v0.1.0 to v1.0.0) is verified before it is merged to `main`.

## 2. Scope
**In scope:** authentication and roles, products/variants/plans, quotations, subscriptions, invoicing and billing, discounts, payments, customer portal, analytics, API contract conformance.
**Out of scope (for now):** load testing at scale, third-party payment gateways (payments are recorded manually per the README).

## 3. Test levels
| Level | Owner | Tooling | When |
|---|---|---|---|
| Unit tests (services, calculations) | Backend (Jeevandas) | pytest / Django TestCase | With each PR |
| API tests | QA (Joseph) + Backend | pytest + DRF APIClient, OpenAPI docs | Each sprint |
| UI / integration checks | Frontend (Amal) + QA | Manual, later Playwright (optional) | Each sprint |
| Acceptance / regression | QA (Joseph) | `docs/acceptance-checklist.md` | End of each sprint |

## 4. High-risk areas (tested first and most deeply)
1. Duplicate billing protection and idempotent invoice/payment processing
2. Tax, discount and total calculations (decimal accuracy, rounding)
3. Subscription state transitions
4. Role-based access control and customer data isolation
5. Recurring billing schedules (Celery Beat) and date handling
6. Database transaction integrity on failure

## 5. Test environment
- Docker Compose stack from the repository (`docker compose up --build`)
- Fresh database seeded with the dataset in `docs/sample-data.md`
- Test accounts: one Admin, one Staff, two Customers

## 6. Entry and exit criteria
- **Entry:** sprint features merged to `develop`, stack runs cleanly, API docs updated.
- **Exit:** all sprint test cases executed, no open Critical/High bugs, checklist signed off.

## 7. Defect management
- Report bugs as GitHub Issues using the **Bug report** template with label `bug`.
- Severity: **Critical** (data loss, wrong money, security), **High** (feature broken), **Medium** (workaround exists), **Low** (cosmetic).
- Each bug is linked to the sprint milestone and the PR that fixes it. QA re-tests before closing.

## 8. Test case coverage per sprint
| Sprint | Modules tested |
|---|---|
| 1 | Infrastructure, health checks, API docs |
| 2 | Authentication, roles, permissions |
| 3 | Products, variants, plans |
| 4 | Quotations, subscriptions, lifecycle |
| 5 | Invoicing, billing, PDF, tax |
| 6 | Discounts, payments, reconciliation |
| 7 | Customer portal, analytics |
| 8 | Full regression, end-to-end flows, security basics |

Detailed cases live in `docs/test-cases.md`.
