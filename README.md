# Subscription Management System

**A unified platform for managing products, plans, subscriptions, recurring billing, invoices, payments, and revenue analytics.**

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Version-0.1.0-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Backend-Django%20REST%20Framework-green?style=flat-square" />
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=flat-square" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-316192?style=flat-square" />
  <img src="https://img.shields.io/badge/Containerized-Docker-2496ED?style=flat-square" />
</p>

---

## Overview

Subscription Management System is a centralized platform designed to simplify and automate the complete subscription lifecycle of a business.

It provides businesses with a unified environment to manage their products, pricing plans, customer subscriptions, quotations, recurring invoices, discounts, payments, and financial reports.

The platform supports three primary user roles:

- **Admin:** Complete system control, configuration, and financial oversight.
- **Staff:** Day-to-day customer, subscription, quotation, and billing operations.
- **Customer:** Self-service access to subscriptions, invoices, and payment history.

The objective is to replace fragmented spreadsheets and manual billing processes with a reliable, automated subscription management platform.

## Key Features

### 1. Authentication & Access Management
- Customer registration and login.
- Secure password validation and reset.
- Role-based access control.
- Admin-managed staff accounts.
- Protected customer and staff portals.

### 2. Product & Plan Management
- Product creation and management.
- Product variants with additional pricing.
- Sales price and cost price management.
- Configurable subscription plans.
- Daily, weekly, monthly, and yearly billing cycles.
- Minimum quantity and plan availability rules.

### 3. Quotation Management
- Reusable quotation templates.
- Configurable quotation validity.
- Product and plan selection.
- Conversion of quotations into subscriptions.

### 4. Subscription Management
- Automatic subscription numbering.
- Subscription lifecycle tracking.
- Draft, Quotation, Confirmed, Active, and Closed states.
- Pause, resume, renew, and early closure.
- Start and expiry date management.

### 5. Automated Invoicing & Billing
- Automatic invoice generation from subscriptions.
- Recurring billing schedules.
- Automatic tax calculations.
- Invoice line items and totals.
- Invoice confirmation and cancellation.
- PDF invoice generation.
- Protection against duplicate billing.

### 6. Discounts & Pricing Rules
- Fixed amount and percentage discounts.
- Minimum purchase and quantity conditions.
- Product-specific and subscription-wide discounts.
- Start and expiry dates.
- Usage limits and automatic discount application.

### 7. Payment Management
- Payment recording and tracking.
- Multiple payment methods.
- Invoice-to-payment reconciliation.
- Outstanding and overdue invoice tracking.
- Payment history.

### 8. Analytics & Reporting
- Active subscription statistics.
- Revenue overview.
- Payment summaries.
- Outstanding and overdue invoice reports.
- Filterable financial dashboards.

### 9. Customer Portal
- View and manage subscriptions.
- Access invoices.
- Review payment history.
- View subscription details and status.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| API State Management | TanStack Query |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL |
| Cache & Message Broker | Redis |
| Background Processing | Celery |
| Task Scheduling | Celery Beat |
| Authentication | JWT |
| API Documentation | drf-spectacular / OpenAPI |
| PDF Generation | WeasyPrint |
| Containerization | Docker, Docker Compose |
| Reverse Proxy | Nginx |
| Version Control | Git, GitHub |
| CI/CD | GitHub Actions |

---

## System Architecture

The application follows a **modular monolithic architecture** with a separate frontend and backend.

```text
                   USERS
                     |
                     v
             Next.js Frontend
                     |
                     v
               REST API
                     |
                     v
             Django Backend
                     |
        +------------+------------+
        |            |            |
        v            v            v
    PostgreSQL     Redis       Business
    Database      Cache        Modules
                                  |
                                  v
                            Celery Workers
                                  |
                                  v
                           Celery Beat
                           Task Scheduler
```

### Backend Modules

- Accounts
- Customers
- Products
- Plans
- Quotations
- Subscriptions
- Invoicing
- Discounts
- Payments
- Analytics

### Repository Structure

```text
subscription-management-system/
│
├── backend/
│   ├── config/
│   ├── apps/
│   ├── services/
│   ├── workers/
│   └── tests/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── lib/
│
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   ├── database-schema.md
│   ├── development-guide.md
│   └── sprint-roadmap.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── CHANGELOG.md
```

---

## Development Setup

The project uses Docker Compose to maintain a consistent development environment.

### Prerequisites

- Git
- Docker Engine
- Docker Compose
- GitHub account

### Clone the Repository

```bash
git clone https://github.com/jeevandas-jd/subscription-management-system.git

cd subscription-management-system
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Update the environment variables according to the development configuration.

### Start the Application

```bash
docker compose up --build
```

The application services will be accessible at their configured local ports.

| Service | Default Address |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/api/docs/ |

*These addresses are planned development endpoints and will be finalized during Sprint 0.*

---

## Development Workflow

We follow a Git-based collaborative development workflow.

### Branch Strategy

```text
main
  |
  └── develop
        |
        ├── feat/backend-*
        ├── feat/frontend-*
        ├── fix/backend-*
        ├── fix/frontend-*
        ├── docs/*
        └── test/*
```

### Contribution Process

1. Pick an assigned GitHub issue.
2. Create a feature branch from `develop`.
3. Implement the assigned feature.
4. Test the implementation.
5. Open a Pull Request against `develop`.
6. Get the changes reviewed.
7. Merge after approval and verification.

Direct commits to `main` are not permitted.

---

## Sprint & Release Roadmap

Development is organized into eight 30-minute sprints, preceded by a project initialization phase.

| Sprint | Version | Scope |
|---|---|---|
| Sprint 0 | — | Repository, architecture, API contract, Docker setup |
| Sprint 1 | v0.1.0 | Foundation & Infrastructure |
| Sprint 2 | v0.2.0 | Authentication & User Management |
| Sprint 3 | v0.3.0 | Products, Variants & Plans |
| Sprint 4 | v0.4.0 | Quotations & Subscriptions |
| Sprint 5 | v0.5.0 | Invoicing & Automated Billing |
| Sprint 6 | v0.6.0 | Discounts & Payments |
| Sprint 7 | v0.7.0 | Customer Portal & Analytics |
| Sprint 8 | v1.0.0 | Integration, Testing & Final Release |

Each sprint aims to deliver an independently verifiable increment of the application.

---

## Team

| Member | Role | Responsibilities |
|---|---|---|
| Jeevandas | Backend Engineer | Backend architecture, APIs, database, business logic, billing engine, Docker and integration |
| Amal Mehabin | Frontend Engineer | Frontend architecture, UI/UX, dashboards, customer portal and API integration |
| Joseph | QA & Documentation | Test cases, sample data, documentation, acceptance testing and project support |

---

## Engineering Principles

- Modular and maintainable architecture.
- API-first development.
- Consistent Docker-based development.
- Secure authentication and authorization.
- Reliable recurring billing.
- Financial calculation accuracy.
- Idempotent payment and invoice processing.
- Database transaction integrity.
- Automated testing and validation.
- Version-controlled incremental releases.

---

## Project Status

**Current phase:** Sprint 0 — Project Initialization

**Current release:** `v0.1.0` (planned)

Development progress and feature updates will be tracked through GitHub Issues, Pull Requests, Milestones, and Releases.

---

## License

To be determined.

---

**Built with Python, TypeScript, PostgreSQL, and Docker.**
