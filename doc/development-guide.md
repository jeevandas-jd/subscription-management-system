# Development Guide

**Project:** Subscription Management System  
**Version:** 1.0  
**Development Approach:** API-first, Docker-first, Sprint-based  
**Primary Branch:** `main`  
**Development Branch:** `develop`

---

## 1. Introduction

This document establishes the development standards, environment setup, Git workflow, coding conventions, testing practices and integration procedures for the Subscription Management System.

All team members must follow these conventions to maintain consistency throughout development.

### Team Responsibilities

| Member | Role | Ownership |
|---|---|---|
| Jeevandas | Team Lead & Backend Engineer | Backend, APIs, database, Docker and integration |
| Amal Mehabin | Frontend Engineer | Frontend, UI/UX and API integration |
| Joseph | QA & Documentation | Testing, documentation and project support |

---

## 2. Technology Requirements

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

### Backend

- Python
- Django
- Django REST Framework
- Celery
- Celery Beat
- drf-spectacular

### Database & Infrastructure

- PostgreSQL
- Redis
- Docker
- Docker Compose
- Nginx
- GitHub Actions

---

## 3. Development Environment

### Prerequisites

Install the following before beginning development:

- Git
- Docker Engine
- Docker Compose
- A code editor (VS Code recommended)
- GitHub access

Python and Node.js are useful for local development and tooling, but the primary application environment should run through Docker.

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/subscription-management-system.git

cd subscription-management-system
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Update the environment variables according to the project configuration.

Never commit `.env` or other files containing secrets.

### Start the Application

```bash
docker compose up --build
```

### Run in Background

```bash
docker compose up -d
```

### View Logs

```bash
docker compose logs -f
```

### Stop Services

```bash
docker compose down
```

### Rebuild a Specific Service

```bash
docker compose up --build backend
```

### Database Migrations

```bash
docker compose exec backend python manage.py makemigrations

docker compose exec backend python manage.py migrate
```

### Create Django Superuser

```bash
docker compose exec backend python manage.py createsuperuser
```

---

## 4. Repository Structure

```text
subscription-management-system/
│
├── backend/
│   ├── config/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── plans/
│   │   ├── quotations/
│   │   ├── subscriptions/
│   │   ├── invoicing/
│   │   ├── discounts/
│   │   ├── payments/
│   │   └── analytics/
│   │
│   ├── services/
│   ├── workers/
│   └── tests/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   └── types/
│
├── docs/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── CHANGELOG.md
```

The structure may evolve during implementation, but major architectural changes must be communicated to the team.

---

## 5. Git & Branching Strategy

The project follows a feature-branch workflow.

### Main Branches

| Branch | Purpose |
|---|---|
| `main` | Stable releases |
| `develop` | Integrated development |

### Feature Branches

Jeevandas:

```text
feat/backend-auth
feat/backend-products
feat/backend-subscriptions
feat/backend-billing
feat/backend-payments
infra/docker-setup
```

Amal:

```text
feat/frontend-auth
feat/frontend-dashboard
feat/frontend-products
feat/frontend-subscriptions
feat/frontend-billing
feat/frontend-customer-portal
```

Joseph:

```text
docs/readme
docs/api-documentation
test/auth-test-cases
test/billing-validation
chore/project-issues
```

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop

git checkout -b feat/backend-auth
```

### Committing Changes

```bash
git add .
git commit -m "feat(auth): implement JWT authentication"
```

### Pushing Changes

```bash
git push -u origin feat/backend-auth
```

### Pull Request Process

1. Create a branch from `develop`.
2. Implement the assigned task.
3. Run relevant tests.
4. Push the branch.
5. Create a Pull Request against `develop`.
6. Request review.
7. Merge after approval.

Direct commits to `main` are prohibited.

---

## 6. Commit Message Convention

Follow Conventional Commits.

Format:

```text
<type>(<scope>): <description>
```

Examples:

```text
feat(auth): implement JWT authentication

feat(products): add product variant management

feat(subscriptions): implement subscription renewal

fix(billing): prevent duplicate invoice generation

docs(api): update subscription endpoints

test(payments): add payment reconciliation tests

refactor(analytics): optimize revenue aggregation

chore(docker): configure redis service
```

### Commit Types

| Type | Usage |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fixes |
| `docs` | Documentation |
| `test` | Testing |
| `refactor` | Code restructuring |
| `chore` | Maintenance |
| `infra` | Infrastructure changes |

---

## 7. Backend Development Standards

### Django Application Structure

Each major business domain should have its own Django application.

Example:

```text
subscriptions/
├── migrations/
├── models.py
├── serializers.py
├── views.py
├── urls.py
├── permissions.py
├── services.py
├── filters.py
└── tests/
```

### Backend Guidelines

- Keep business logic separate from views.
- Use serializers for input validation.
- Use service functions for complex operations.
- Use Django ORM for database operations.
- Use transactions for financial operations.
- Apply role-based permissions.
- Document API changes.
- Write tests for critical business logic.

### API Development

All APIs must follow the contract in:

`docs/api-contract.md`

API base path:

```text
/api/v1/
```

Use consistent naming, status codes, pagination and error formats.

Generate API documentation using drf-spectacular.

### Financial Calculations

- Use Python Decimal for monetary values.
- Never use floating-point arithmetic for money.
- Perform calculations on the backend.
- Preserve historical invoice amounts.
- Validate payment amounts against outstanding balances.
- Use database transactions for invoice and payment operations.

---

## 8. Frontend Development Standards

### Frontend Structure

```text
frontend/
├── app/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── products/
│   ├── plans/
│   ├── quotations/
│   ├── subscriptions/
│   ├── invoices/
│   ├── payments/
│   └── customers/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   └── dashboard/
│
├── services/
│   └── api/
│
├── hooks/
├── lib/
└── types/
```

### Frontend Guidelines

- Use TypeScript throughout the application.
- Create reusable components.
- Separate API calls from UI components.
- Use TanStack Query for server-state management.
- Use React Hook Form and Zod for form validation.
- Handle loading, error and empty states.
- Maintain consistent UI components.
- Respect backend role permissions.
- Keep API response types synchronized with the API contract.

### API Integration

All backend requests should use a centralized API service layer.

Avoid scattering direct HTTP requests throughout UI components.

---

## 9. Docker Development Policy

Docker is mandatory throughout development.

The application should run using a common Docker Compose environment.

### Services

| Service | Responsibility |
|---|---|
| frontend | Next.js application |
| backend | Django REST API |
| db | PostgreSQL |
| redis | Cache and task broker |
| celery | Background processing |
| celery-beat | Scheduled jobs |

### Important Rules

- Use persistent database volumes.
- Store credentials in environment variables.
- Never commit secrets.
- Keep Dockerfiles optimized.
- Use health checks where appropriate.
- Ensure service dependencies are configured.
- Avoid manually modifying container state as a substitute for updating project configuration.

---

## 10. Testing Standards

Testing is a shared responsibility.

### Backend Testing

Use Pytest and Django REST Framework APIClient.

Test:

- Authentication.
- Role permissions.
- Product and plan validation.
- Subscription state transitions.
- Quotation conversion.
- Invoice calculations.
- Tax and discount calculations.
- Payment reconciliation.
- Duplicate billing prevention.

### Frontend Testing

Use appropriate component and browser testing tools.

Test:

- Form validation.
- Navigation.
- Authentication flows.
- API integration.
- Loading and error states.
- Role-based interfaces.
- Responsive layouts.

### QA Responsibilities — Joseph

- Maintain test scenarios.
- Prepare sample datasets.
- Execute acceptance checklists.
- Report reproducible bugs.
- Verify expected versus actual results.

---

## 11. API Contract Management

The API contract is the single source of truth for frontend/backend communication.

Location:

`docs/api-contract.md`

Any changes to the following must be documented:

- Endpoint URLs.
- HTTP methods.
- Request fields.
- Response fields.
- Data types.
- Authentication requirements.
- Permissions.
- Error formats.

The frontend and backend owners must agree on breaking changes before implementation.

---

## 12. Sprint & Release Management

The project follows eight development sprints, each planned for 30 minutes.

| Sprint | Version | Feature |
|---|---|---|
| 1 | v0.1.0 | Foundation |
| 2 | v0.2.0 | Authentication |
| 3 | v0.3.0 | Products and Plans |
| 4 | v0.4.0 | Quotations and Subscriptions |
| 5 | v0.5.0 | Billing |
| 6 | v0.6.0 | Discounts and Payments |
| 7 | v0.7.0 | Analytics and Customer Portal |
| 8 | v1.0.0 | Final Integration |

### Sprint Protocol

| Time | Activity |
|---|---|
| 00–20 min | Development |
| 20–25 min | Integration |
| 25–28 min | Verification |
| 28–30 min | Release |

A release is created only after the integration checks pass.

---

## 13. Security Guidelines

- Never commit credentials or secret keys.
- Use environment variables for sensitive configuration.
- Enforce authentication on protected endpoints.
- Enforce object-level authorization.
- Validate all user input.
- Never trust frontend-provided financial totals.
- Protect customer data isolation.
- Use secure password hashing.
- Avoid exposing internal error traces in production.
- Use HTTPS in production deployments.

---

## 14. Documentation Standards

Maintain the following documents:

| Document | Purpose |
|---|---|
| `README.md` | Project overview and setup |
| `docs/architecture.md` | System architecture |
| `docs/api-contract.md` | API definitions |
| `docs/database-schema.md` | Database design |
| `docs/development-guide.md` | Development conventions |
| `docs/projectplan-worksplit.md` | Sprint planning and responsibilities |
| `CHANGELOG.md` | Release history |

Documentation must be updated when relevant architecture, API or workflow changes are introduced.

---

## 15. Definition of Done

A task is considered complete when:

- Implementation is finished.
- Relevant tests pass.
- API contract is updated if necessary.
- Docker environment works.
- No known regression is introduced.
- Code is pushed to the appropriate branch.
- Pull Request is reviewed and merged.
- Relevant documentation is updated.

A sprint is complete when its deliverables are integrated and verified.

---

## Development Philosophy

**Build incrementally. Integrate continuously. Test consistently. Document everything important.**

Every team member is responsible for maintaining the quality and reliability of the shared application.

**Project Lead:** Jeevandas  
**Frontend Engineer:** Amal Mehabin  
**QA & Documentation:** Joseph
