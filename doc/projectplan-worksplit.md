# Project Plan & Workload Distribution

**Project:** Subscription Management System  
**Development Model:** Sprint-based incremental development  
**Total Development Sprints:** 8  
**Sprint Duration:** 30 minutes  
**Total Planned Sprint Time:** 4 hours  
**Infrastructure:** Docker-first development

---

# 1. Project Objective

Build a unified Subscription Management System that manages the complete subscription lifecycle of a business, from product and plan creation to subscription management, recurring invoicing, payments, and revenue analytics.

The application will provide three levels of access:

- **Admin:** Complete system administration and financial oversight.
- **Staff:** Customer management and day-to-day subscription operations.
- **Customer:** Self-service subscription and invoice management.

The project will be developed incrementally, with each sprint delivering a working and verifiable version of the application.

# 2. Team Composition & Responsibilities

The workload is intentionally distributed according to each member's technical expertise and experience.

## 2.1 Jeevandas — Team Lead & Backend Engineer

**Primary ownership:** Backend development, system architecture and integration.

Responsibilities:

- Overall technical leadership.
- Backend architecture and Django application structure.
- Database schema and ORM models.
- REST API development.
- Authentication and role-based access control.
- Product, plan and subscription business logic.
- Quotation management.
- Recurring billing engine.
- Invoice and tax calculations.
- Discount and payment management.
- Analytics APIs.
- Docker configuration and backend deployment.
- API documentation.
- Code reviews and final integration.
- Sprint releases and version management.

**Ownership:** Entire backend and technical integration.

## 2.2 Amal Mehabin — Frontend Engineer

**Primary ownership:** Complete frontend application.

Responsibilities:

- Frontend architecture using Next.js and TypeScript.
- UI/UX design and implementation.
- Admin dashboard.
- Authentication interfaces.
- Product and plan management interfaces.
- Quotation management interfaces.
- Subscription management interfaces.
- Invoice and payment interfaces.
- Discount management interfaces.
- Customer portal.
- Analytics and reporting dashboards.
- API integration with Django.
- Responsive design and frontend testing.
- Final UI integration and polish.

**Ownership:** Entire frontend application.

## 2.3 Joseph — QA, Documentation & Development Support

**Primary ownership:** Documentation, validation and supporting development tasks.

Responsibilities:

- Project documentation.
- README and changelog maintenance.
- GitHub issue and milestone management.
- API documentation review.
- Sample datasets and test fixtures.
- Test case preparation.
- Subscription workflow validation.
- Invoice and payment verification.
- Discount calculation test scenarios.
- Dashboard data validation.
- Bug reporting.
- Final acceptance testing.
- Demo documentation.

**Ownership:** Assigned documentation, testing and support deliverables.

Joseph's tasks are designed to be independent and manageable, allowing him to contribute without becoming a dependency for backend or frontend development.

# 3. Sprint 0 — Project Initialization

**Status:** Pre-development phase  
**Release:** No application release  
**Objective:** Prepare the complete development environment before Sprint 1.

### Jeevandas

- Create the GitHub repository.
- Add team collaborators.
- Establish main and develop branches.
- Define system architecture.
- Design initial database entities.
- Prepare the API contract.
- Define authentication and permission conventions.
- Establish Docker development configuration.

### Amal Mehabin

- Finalize frontend technology choices.
- Define frontend folder structure.
- Establish routing conventions.
- Select reusable UI components.
- Define API integration conventions.
- Review the API contract.
- Identify frontend data requirements.

### Joseph

- Prepare README.md.
- Create GitHub issue templates.
- Configure project labels and milestones.
- Prepare sample product and subscription data.
- Prepare acceptance checklists.
- Document project features and development workflow.

### Sprint 0 Deliverables

- GitHub repository initialized.
- Team access configured.
- Initial repository structure created.
- API contract documented.
- Database architecture documented.
- Docker configuration prepared.
- Development workflow established.
- Sprint issues assigned.

---

# 4. Eight-Sprint Development Roadmap

## Sprint 1 — Foundation & Infrastructure

**Duration:** 30 minutes  
**Release:** `v0.1.0-foundation`

**Objective:** Establish the complete application foundation.

### Jeevandas
- Initialize Django project.
- Configure Django REST Framework.
- Configure PostgreSQL.
- Establish initial backend structure.
- Configure backend Dockerfile.
- Create health-check endpoint.
- Configure environment variables.

### Amal Mehabin
- Initialize Next.js with TypeScript.
- Configure Tailwind CSS.
- Configure shadcn/ui.
- Establish frontend folder structure.
- Create application layout.
- Implement initial dashboard shell.
- Configure frontend Dockerfile.

### Joseph
- Verify README installation instructions.
- Document environment variables.
- Prepare project setup guide.
- Review initial repository structure.

### Deliverables
- Docker Compose foundation.
- Frontend and backend containers.
- PostgreSQL connection.
- Backend health-check API.
- Initial dashboard interface.
- Setup documentation.

---

## Sprint 2 — Authentication & User Management

**Duration:** 30 minutes  
**Release:** `v0.2.0-auth`

**Objective:** Implement authentication and role-based access.

### Jeevandas
- Create user model.
- Implement registration API.
- Implement JWT authentication.
- Implement token refresh.
- Implement password validation.
- Implement password reset workflow.
- Implement role-based permissions.
- Restrict staff creation to administrators.

### Amal Mehabin
- Login interface.
- Registration interface.
- Forgot-password interface.
- Authentication state management.
- Protected frontend routes.
- Role-based navigation.
- Authentication API integration.

### Joseph
- Prepare authentication test cases.
- Verify registration validation scenarios.
- Test sample user accounts.
- Document authentication workflows.

### Deliverables
- Customer registration.
- Login and logout.
- JWT authentication.
- Password reset.
- Admin, staff and customer roles.
- Protected application routes.

---

## Sprint 3 — Products, Variants & Plans

**Duration:** 30 minutes  
**Release:** `v0.3.0-catalogue`

**Objective:** Implement product catalogue and subscription plans.

### Jeevandas
- Create product model.
- Create product variant model.
- Create subscription plan model.
- Implement product CRUD APIs.
- Implement variant CRUD APIs.
- Implement plan CRUD APIs.
- Implement variant pricing calculations.
- Implement billing interval validation.

### Amal Mehabin
- Product listing interface.
- Product creation and editing.
- Product variant management.
- Plan listing interface.
- Plan creation and editing.
- Pricing and billing configuration UI.
- API integration.

### Joseph
- Prepare sample product datasets.
- Prepare subscription plan examples.
- Verify variant pricing calculations.
- Document supported billing intervals.

### Deliverables
- Product management.
- Product variants.
- Additional variant pricing.
- Daily, weekly, monthly and yearly plans.
- Plan availability configuration.
- Minimum quantity rules.
- Plan lifecycle configuration.

---

## Sprint 4 — Quotations & Subscription Lifecycle

**Duration:** 30 minutes  
**Release:** `v0.4.0-subscriptions`

**Objective:** Implement quotation workflows and subscription lifecycle management.

### Jeevandas
- Create quotation model.
- Create quotation template model.
- Create subscription model.
- Create subscription line items.
- Implement quotation CRUD APIs.
- Implement quotation conversion.
- Implement subscription numbering.
- Implement subscription lifecycle transitions.
- Implement pause, resume, renewal and closure logic.

### Amal Mehabin
- Quotation listing interface.
- Quotation creation form.
- Quotation template interface.
- Subscription creation interface.
- Subscription detail page.
- Subscription status management.
- Lifecycle action interfaces.

### Joseph
- Prepare quotation examples.
- Document subscription lifecycle.
- Validate permitted status transitions.
- Test quotation conversion scenarios.

### Deliverables
- Quotation templates.
- Quotation validity.
- Quotation-to-subscription conversion.
- Subscription numbering.
- Subscription start and expiry dates.
- Draft, Quotation, Confirmed, Active and Closed states.
- Pause, resume, renew and early closure.

---

## Sprint 5 — Invoicing & Automated Billing

**Duration:** 30 minutes  
**Release:** `v0.5.0-billing`

**Objective:** Implement automated recurring invoicing.

### Jeevandas
- Create invoice model.
- Create invoice line items.
- Implement tax calculation.
- Implement invoice generation service.
- Configure Celery.
- Configure Redis.
- Configure Celery Beat.
- Implement recurring billing jobs.
- Implement duplicate invoice prevention.
- Implement invoice status transitions.
- Implement PDF generation.

### Amal Mehabin
- Invoice listing interface.
- Invoice detail interface.
- Invoice line item display.
- Tax and total breakdown.
- Invoice status management.
- PDF preview and download interface.
- Billing history interface.

### Joseph
- Prepare invoice calculation scenarios.
- Verify invoice totals.
- Test sample tax calculations.
- Validate billing period scenarios.
- Document invoice workflow.

### Deliverables
- Automated invoice generation.
- Recurring billing scheduler.
- Invoice line items.
- Automatic tax calculation.
- Draft, Confirmed, Paid and Cancelled states.
- PDF invoices.
- Duplicate billing prevention.

---

## Sprint 6 — Discounts & Payments

**Duration:** 30 minutes  
**Release:** `v0.6.0-finance`

**Objective:** Complete the financial transaction workflow.

### Jeevandas
- Create discount model.
- Implement discount calculation engine.
- Implement discount eligibility validation.
- Implement usage limits.
- Create payment model.
- Implement payment recording APIs.
- Implement invoice reconciliation.
- Implement outstanding balance calculations.
- Implement partial payment support.

### Amal Mehabin
- Discount listing interface.
- Discount creation and editing.
- Discount configuration interface.
- Payment recording interface.
- Payment history.
- Invoice payment status.
- Outstanding balance display.

### Joseph
- Prepare fixed discount test scenarios.
- Prepare percentage discount scenarios.
- Verify discount limits and expiry.
- Prepare payment test data.
- Validate invoice-to-payment matching.

### Deliverables
- Fixed and percentage discounts.
- Minimum purchase conditions.
- Quantity-based discounts.
- Discount validity and usage limits.
- Payment recording.
- Multiple payment methods.
- Payment-to-invoice reconciliation.
- Partial payments.
- Outstanding invoice tracking.

---

## Sprint 7 — Customer Portal & Analytics

**Duration:** 30 minutes  
**Release:** `v0.7.0-analytics`

**Objective:** Implement customer self-service and business analytics.

### Jeevandas
- Implement dashboard summary APIs.
- Implement revenue aggregation.
- Implement subscription statistics.
- Implement overdue invoice calculations.
- Implement customer portal APIs.
- Optimize database queries.
- Add appropriate database indexes.
- Validate performance.

### Amal Mehabin
- Admin dashboard.
- Revenue charts.
- Subscription statistics.
- Payment summary cards.
- Outstanding invoice dashboard.
- Customer portal.
- Customer subscription history.
- Customer invoice history.
- Dashboard filtering.
- Responsive UI improvements.

### Joseph
- Verify dashboard figures.
- Compare revenue summaries against sample records.
- Validate overdue invoice calculations.
- Test customer data isolation.
- Prepare acceptance checklist.

### Deliverables
- Active subscription statistics.
- Revenue overview.
- Payment summary.
- Overdue invoice reporting.
- Customer portal.
- Subscription history.
- Invoice history.
- Dashboard filters.
- Performance optimization.

---

## Sprint 8 — Integration, Testing & Final Release

**Duration:** 30 minutes  
**Release:** `v1.0.0`

**Objective:** Deliver the fully integrated and Dockerized application.

### Jeevandas
- Final backend integration.
- Resolve backend defects.
- Validate database integrity.
- Review authorization.
- Verify recurring billing reliability.
- Verify financial calculations.
- Optimize backend queries.
- Finalize Docker configuration.
- Review deployment readiness.
- Manage final release.

### Amal Mehabin
- Final frontend integration.
- Resolve UI defects.
- Verify all API integrations.
- Improve responsive layouts.
- Verify role-based interfaces.
- Finalize dashboard.
- Complete UI polish.

### Joseph
- Execute acceptance test cases.
- Verify complete subscription workflows.
- Test invoice and payment scenarios.
- Document discovered defects.
- Verify README and setup instructions.
- Prepare demo instructions.
- Prepare final QA report.

### Deliverables
- Fully integrated application.
- All major features connected.
- Docker Compose startup verified.
- Database migrations verified.
- Authentication and permissions validated.
- End-to-end workflow tested.
- Final documentation.
- Release `v1.0.0`.

---

# 5. Git & GitHub Workflow

## 5.1 Branch Structure

```text
main
  |
  └── develop
        |
        ├── feat/backend-*
        ├── feat/frontend-*
        ├── fix/backend-*
        ├── fix/frontend-*
        ├── infra/*
        ├── docs/*
        └── test/*
```

## 5.2 Branch Ownership

| Member | Branch Prefix |
|---|---|
| Jeevandas | `feat/backend-*`, `fix/backend-*`, `infra/*` |
| Amal Mehabin | `feat/frontend-*`, `fix/frontend-*` |
| Joseph | `docs/*`, `test/*`, `chore/*` |

## 5.3 Pull Request Process

1. Create a branch from `develop`.
2. Implement the assigned task.
3. Test the changes.
4. Open a Pull Request against `develop`.
5. Review and validate changes.
6. Merge after approval.
7. Update the relevant sprint milestone.

Jeevandas acts as the primary integration reviewer.

Direct commits to `main` are prohibited.

---

# 6. Versioning Strategy

The project follows Semantic Versioning conventions.

| Release | Version | Milestone |
|---|---|---|
| Sprint 1 | v0.1.0 | Foundation |
| Sprint 2 | v0.2.0 | Authentication |
| Sprint 3 | v0.3.0 | Catalogue |
| Sprint 4 | v0.4.0 | Subscriptions |
| Sprint 5 | v0.5.0 | Billing |
| Sprint 6 | v0.6.0 | Finance |
| Sprint 7 | v0.7.0 | Analytics |
| Sprint 8 | v1.0.0 | Final Release |

Release tags must only be created after integration and verification.

Example:

```bash
git checkout develop
git pull origin develop

git tag -a v0.1.0 -m "Sprint 1: Foundation"
git push origin v0.1.0
```

Each release must include:
- Version tag.
- Changelog update.
- Feature summary.
- Known issues, if any.
- Verification status.

---

# 7. Docker-First Development Policy

Docker is mandatory throughout the project.

All members must work against a common containerized environment.

## Services

| Service | Purpose |
|---|---|
| frontend | Next.js application |
| backend | Django REST API |
| db | PostgreSQL |
| redis | Cache and task broker |
| celery | Background processing |
| celery-beat | Scheduled billing tasks |

## Standard Commands

Start application:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up -d
```

View logs:

```bash
docker compose logs -f
```

Stop application:

```bash
docker compose down
```

Run database migrations:

```bash
docker compose exec backend python manage.py migrate
```

Create superuser:

```bash
docker compose exec backend python manage.py createsuperuser
```

PostgreSQL data must be persisted using Docker volumes.

Secrets must be maintained through environment variables and must never be committed to GitHub.

---

# 8. Sprint Execution Protocol

Each development sprint lasts 30 minutes.

| Time | Activity |
|---|---|
| 00–20 min | Independent feature development |
| 20–25 min | Pull requests and integration |
| 25–28 min | Docker verification and testing |
| 28–30 min | Changelog update and release |

This is the target workflow. If an integration issue prevents a reliable release, it must be documented and resolved rather than bypassed.

## Sprint Acceptance Criteria

A sprint is considered complete when:

- Assigned tasks have been implemented.
- Backend and frontend changes are integrated.
- Docker services start successfully.
- Newly introduced features are verified.
- Previously working functionality remains intact.
- Relevant documentation is updated.
- GitHub milestone is updated.
- Release tag is created when verification passes.

---

# 9. Communication & Integration Rules

1. The API contract is the shared source of truth.
2. Backend changes affecting frontend integration must be communicated.
3. Frontend and backend must agree on endpoint names and response structures.
4. Database schema changes must be documented.
5. All developers must use the shared Docker environment.
6. All work must be tracked through GitHub Issues.
7. All code changes must go through Pull Requests.
8. Bugs must be reported with reproduction steps.
9. Financial calculations must be verified before release.
10. No sprint release should break previously verified functionality.

---

# 10. Project Completion Criteria

The project is considered complete when:

- Admin, staff and customer roles work correctly.
- Products, variants and plans can be managed.
- Quotations can be created and converted.
- Subscription lifecycle operations work.
- Recurring invoices are generated reliably.
- Tax and discount calculations are correct.
- Payments can be recorded and reconciled.
- Customers can access their own subscriptions and invoices.
- Revenue and overdue reports are available.
- The application runs through Docker Compose.
- Core workflows pass integration and acceptance tests.
- Project documentation is complete.

---

# 11. Workload Ownership Summary

| Work Area | Jeevandas | Amal | Joseph |
|---|---|---|---|
| Architecture | Lead | Review | — |
| Backend | Primary | — | Support |
| Frontend | Integration | Primary | — |
| Database | Primary | — | Test data |
| API Contract | Primary | Review | Documentation |
| Docker | Primary | Frontend integration | Verification |
| Authentication | Backend | UI | Testing |
| Products & Plans | Backend | UI | Sample data |
| Subscriptions | Backend | UI | Validation |
| Billing | Backend | UI | Test scenarios |
| Payments | Backend | UI | Validation |
| Analytics | Backend | UI | Verification |
| Documentation | Review | Review | Primary |
| QA | Integration | Frontend testing | Primary support |
| Final Release | Lead | Frontend release | Acceptance testing |

---

**Project Lead:** Jeevandas  
**Frontend Engineer:** Amal Mehabin  
**QA & Documentation:** Joseph  

**Project Philosophy:**

Build incrementally. Integrate continuously. Test every release. Maintain one working application throughout development.

**Target Release:** `v1.0.0`
