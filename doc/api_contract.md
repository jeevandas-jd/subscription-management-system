# API Contract — Subscription Management System

**API Version:** v1  
**Base URL:** `/api/v1/`  
**Architecture:** REST API  
**Format:** JSON  
**Authentication:** JWT Bearer Token  
**Status:** Initial Specification — Sprint 0

---

## 1. Introduction

This document defines the communication contract between the Next.js frontend and Django REST Framework backend.

It establishes standardized API endpoints, request structures, response formats, authentication mechanisms, permissions, and error handling conventions.

Both frontend and backend developers must follow this contract to ensure consistent integration.

### 1.1 User Roles

| Role | Description |
|---|---|
| `admin` | Complete system access and configuration |
| `staff` | Operational access to customers, quotations, subscriptions, invoices and payments |
| `customer` | Access to their own subscriptions, invoices and payment history |

### 1.2 General Conventions

- All endpoints are prefixed with `/api/v1/`.
- All request and response bodies use JSON unless explicitly stated.
- All protected endpoints require JWT authentication.
- Dates use ISO 8601 format.
- Monetary values are represented as decimal strings.
- Database identifiers are represented as integers initially.
- Pagination is enabled for collection endpoints.
- API timestamps are returned in UTC.

---

## 2. Authentication

Authentication uses JWT access and refresh tokens.

### 2.1 Register Customer

`POST /api/v1/auth/register/`

**Permission:** Public

Request:

```json
{
  "email": "customer@example.com",
  "password": "SecurePassword@123",
  "first_name": "John",
  "last_name": "Doe"
}
```

Response — `201 Created`:

```json
{
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  }
}
```

Rules:
- Email must be unique.
- Password must contain more than eight characters.
- Password must contain uppercase, lowercase and special characters.
- Public registration can only create customer accounts.

### 2.2 Login

`POST /api/v1/auth/login/`

**Permission:** Public

Request:

```json
{
  "email": "customer@example.com",
  "password": "SecurePassword@123"
}
```

Response — `200 OK`:

```json
{
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token",
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  }
}
```

### 2.3 Refresh Token

`POST /api/v1/auth/token/refresh/`

Request:

```json
{
  "refresh": "jwt-refresh-token"
}
```

Response:

```json
{
  "access": "new-jwt-access-token"
}
```

### 2.4 Current User

`GET /api/v1/auth/me/`

**Permission:** Authenticated

Response:

```json
{
  "id": 1,
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer"
}
```

### 2.5 Password Reset

`POST /api/v1/auth/password-reset/`

Request:

```json
{
  "email": "customer@example.com"
}
```

Response:

```json
{
  "message": "If the account exists, a password reset link will be sent."
}
```

### 2.6 Confirm Password Reset

`POST /api/v1/auth/password-reset/confirm/`

Request:

```json
{
  "uid": "encoded-user-id",
  "token": "reset-token",
  "new_password": "NewSecurePassword@123"
}
```

### 2.7 Create Staff Account

`POST /api/v1/auth/staff/`

**Permission:** Admin only

Request:

```json
{
  "email": "staff@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "StaffPassword@123"
}
```

---

## 3. Customers

### 3.1 List Customers

`GET /api/v1/customers/`

**Permission:** Admin, Staff

Query parameters:

| Parameter | Description |
|---|---|
| `search` | Search by name or email |
| `page` | Page number |
| `page_size` | Results per page |

Response:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/v1/customers/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "email": "customer@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  ]
}
```

### 3.2 Customer Details

`GET /api/v1/customers/{id}/`

**Permission:** Admin, Staff; customers may access their own profile.

### 3.3 Update Customer

`PATCH /api/v1/customers/{id}/`

**Permission:** Admin, Staff; customers may update permitted fields on their own profile.

---

## 4. Products & Variants

### 4.1 List Products

`GET /api/v1/products/`

**Permission:** Admin, Staff

Query parameters:

- `search`
- `type`
- `page`
- `page_size`

### 4.2 Create Product

`POST /api/v1/products/`

**Permission:** Admin only

Request:

```json
{
  "name": "Software Subscription",
  "type": "service",
  "sales_price": "1000.00",
  "cost_price": "400.00",
  "notes": "Standard software product"
}
```

Response — `201 Created`:

```json
{
  "id": 1,
  "name": "Software Subscription",
  "type": "service",
  "sales_price": "1000.00",
  "cost_price": "400.00",
  "notes": "Standard software product",
  "created_at": "2026-10-31T10:00:00Z"
}
```

### 4.3 Product Details

`GET /api/v1/products/{id}/`

### 4.4 Update Product

`PATCH /api/v1/products/{id}/`

**Permission:** Admin only

### 4.5 Delete Product

`DELETE /api/v1/products/{id}/`

**Permission:** Admin only

Deletion must be prevented where existing financial or subscription records depend on the product. Archiving is preferred.

### 4.6 Product Variants

`GET /api/v1/products/{id}/variants/`

`POST /api/v1/products/{id}/variants/`

Request:

```json
{
  "name": "Odoo",
  "additional_price": "560.00"
}
```

**Permission:** Admin only for creation and modification.

---

## 5. Subscription Plans

### 5.1 List Plans

`GET /api/v1/plans/`

**Permission:** Admin, Staff

Query parameters:

- `billing_interval`
- `is_active`
- `search`
- `page`
- `page_size`

### 5.2 Create Plan

`POST /api/v1/plans/`

**Permission:** Admin only

Request:

```json
{
  "name": "Monthly Business Plan",
  "billing_interval": "monthly",
  "billing_interval_count": 1,
  "minimum_quantity": 1,
  "available_from": "2026-10-31",
  "available_until": "2027-10-31",
  "auto_close": true,
  "allow_early_close": true,
  "allow_pause": true,
  "allow_renewal": true
}
```

### 5.3 Plan Details

`GET /api/v1/plans/{id}/`

### 5.4 Update Plan

`PATCH /api/v1/plans/{id}/`

### 5.5 Delete Plan

`DELETE /api/v1/plans/{id}/`

**Permission:** Admin only. Existing subscription references must be protected.

---

## 6. Quotations

### 6.1 List Quotations

`GET /api/v1/quotations/`

**Permission:** Admin, Staff

### 6.2 Create Quotation

`POST /api/v1/quotations/`

Request:

```json
{
  "customer_id": 1,
  "valid_until": "2026-11-15",
  "template_id": 1,
  "lines": [
    {
      "product_id": 1,
      "variant_id": 1,
      "plan_id": 1,
      "quantity": 5
    }
  ],
  "payment_terms": "Net 30"
}
```

### 6.3 Quotation Details

`GET /api/v1/quotations/{id}/`

### 6.4 Update Quotation

`PATCH /api/v1/quotations/{id}/`

### 6.5 Convert Quotation to Subscription

`POST /api/v1/quotations/{id}/convert/`

Request:

```json
{
  "start_date": "2026-11-01",
  "expiry_date": "2027-11-01"
}
```

Response:

```json
{
  "message": "Quotation converted successfully",
  "subscription_id": 101,
  "subscription_number": "SUB-2026-00101",
  "status": "confirmed"
}
```

---

## 7. Subscriptions

### 7.1 List Subscriptions

`GET /api/v1/subscriptions/`

**Permission:** Admin, Staff; customers see only their own.

Query parameters:

| Parameter | Description |
|---|---|
| `status` | Filter by status |
| `customer_id` | Filter by customer |
| `plan_id` | Filter by plan |
| `search` | Search subscription number |
| `page` | Page number |
| `page_size` | Results per page |

### 7.2 Create Subscription

`POST /api/v1/subscriptions/`

Request:

```json
{
  "customer_id": 1,
  "plan_id": 1,
  "start_date": "2026-11-01",
  "expiry_date": "2027-11-01",
  "payment_terms": "Net 30",
  "lines": [
    {
      "product_id": 1,
      "variant_id": 1,
      "quantity": 5,
      "unit_price": "1000.00"
    }
  ]
}
```

### 7.3 Subscription Details

`GET /api/v1/subscriptions/{id}/`

### 7.4 Update Subscription

`PATCH /api/v1/subscriptions/{id}/`

Only permitted fields can be changed depending on lifecycle status.

### 7.5 Subscription Actions

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/subscriptions/{id}/confirm/` | Confirm |
| POST | `/subscriptions/{id}/pause/` | Pause |
| POST | `/subscriptions/{id}/resume/` | Resume |
| POST | `/subscriptions/{id}/renew/` | Renew |
| POST | `/subscriptions/{id}/close/` | Close |

**Subscription status values:**

- `draft`
- `quotation`
- `confirmed`
- `active`
- `paused`
- `closed`

Status transitions must be validated by the backend.

---

## 8. Invoicing

### 8.1 List Invoices

`GET /api/v1/invoices/`

**Permission:** Admin, Staff; customers see their own invoices.

Query parameters:

- `status`
- `customer_id`
- `subscription_id`
- `due_date_from`
- `due_date_to`
- `page`
- `page_size`

### 8.2 Generate Invoice

`POST /api/v1/invoices/`

Request:

```json
{
  "subscription_id": 101,
  "billing_period_start": "2026-11-01",
  "billing_period_end": "2026-12-01"
}
```

The backend calculates line items, discounts, taxes and totals. Clients must not be trusted to provide final invoice amounts.

### 8.3 Invoice Details

`GET /api/v1/invoices/{id}/`

### 8.4 Confirm Invoice

`POST /api/v1/invoices/{id}/confirm/`

### 8.5 Cancel Invoice

`POST /api/v1/invoices/{id}/cancel/`

Request:

```json
{
  "reason": "Subscription cancelled"
}
```

### 8.6 Download Invoice PDF

`GET /api/v1/invoices/{id}/pdf/`

Returns a PDF file.

**Invoice statuses:**

- `draft`
- `confirmed`
- `paid`
- `cancelled`

Overdue status is calculated from the due date and outstanding balance rather than treated as a payment status.

---

## 9. Discounts

### 9.1 List Discounts

`GET /api/v1/discounts/`

**Permission:** Admin, Staff

### 9.2 Create Discount

`POST /api/v1/discounts/`

**Permission:** Admin only

Request:

```json
{
  "name": "Bulk Purchase Discount",
  "discount_type": "percentage",
  "value": "10.00",
  "minimum_purchase": "1000.00",
  "minimum_quantity": 5,
  "starts_at": "2026-11-01T00:00:00Z",
  "ends_at": "2026-12-31T23:59:59Z",
  "usage_limit": 100,
  "scope": "subscription",
  "product_ids": [1, 2]
}
```

### 9.3 Discount Details

`GET /api/v1/discounts/{id}/`

### 9.4 Update Discount

`PATCH /api/v1/discounts/{id}/`

### 9.5 Delete Discount

`DELETE /api/v1/discounts/{id}/`

The backend validates discount eligibility, expiry, usage limits, product scope and minimum purchase requirements before application.

---

## 10. Payments

### 10.1 List Payments

`GET /api/v1/payments/`

**Permission:** Admin, Staff; customers see their own payments.

Query parameters:

- `invoice_id`
- `customer_id`
- `payment_method`
- `date_from`
- `date_to`
- `page`
- `page_size`

### 10.2 Record Payment

`POST /api/v1/payments/`

**Permission:** Admin, Staff

Request:

```json
{
  "invoice_id": 501,
  "amount": "5000.00",
  "payment_method": "bank_transfer",
  "payment_date": "2026-11-05T10:00:00Z",
  "reference": "TXN-123456",
  "notes": "Bank transfer received"
}
```

Response:

```json
{
  "id": 1,
  "invoice_id": 501,
  "amount": "5000.00",
  "payment_method": "bank_transfer",
  "payment_date": "2026-11-05T10:00:00Z",
  "reference": "TXN-123456",
  "status": "recorded"
}
```

### 10.3 Payment Details

`GET /api/v1/payments/{id}/`

Payments must be validated against the invoice balance. Partial payments must be supported. Overpayments and duplicate payment records must be handled explicitly.

---

## 11. Analytics & Dashboard

### 11.1 Dashboard Overview

`GET /api/v1/analytics/overview/`

**Permission:** Admin, Staff

Response:

```json
{
  "active_subscriptions": 250,
  "total_customers": 180,
  "revenue_received": "125000.00",
  "outstanding_amount": "25000.00",
  "overdue_invoices": 12,
  "pending_invoices": 30
}
```

### 11.2 Revenue Reports

`GET /api/v1/analytics/revenue/`

Query parameters:

- `date_from`
- `date_to`
- `group_by` — day, week, month, year

### 11.3 Subscription Statistics

`GET /api/v1/analytics/subscriptions/`

### 11.4 Overdue Invoices

`GET /api/v1/analytics/overdue/`

All financial analytics must use consistent definitions for invoice totals, payments received, outstanding balances and reporting periods.

---

## 12. Customer Portal

The customer portal uses existing subscription, invoice and payment APIs with customer-level permission restrictions.

Additional customer-facing endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/customer-portal/overview/` | Customer dashboard |
| GET | `/api/v1/customer-portal/subscriptions/` | Own subscriptions |
| GET | `/api/v1/customer-portal/invoices/` | Own invoices |
| GET | `/api/v1/customer-portal/payments/` | Own payments |

Customers must never be able to access another customer's data by changing an ID or query parameter.

---

## 13. Standard Response & Error Handling

### 13.1 HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful deletion or action without response body |
| 400 | Validation error |
| 401 | Authentication required or invalid |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Business rule or state conflict |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### 13.2 Standard Error Response

```json
{
  "detail": "Validation failed",
  "errors": {
    "quantity": [
      "Quantity must be greater than zero."
    ]
  }
}
```

### 13.3 Pagination Format

All paginated collection endpoints follow:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/v1/products/?page=2",
  "previous": null,
  "results": []
}
```

Default page size: 20.

Maximum page size: 100.

---

## 14. Business & Data Integrity Rules

These rules are mandatory backend responsibilities.

### 14.1 Financial Accuracy

- Use decimal arithmetic for all monetary calculations.
- Never use floating-point arithmetic for financial values.
- Calculate taxes and discounts on the backend.
- Maintain consistent rounding rules.
- Preserve historical invoice values even when product prices change.

### 14.2 Recurring Billing

- Use Celery Beat to schedule billing jobs.
- Generate invoices from eligible subscriptions.
- Prevent duplicate invoices for the same subscription and billing period.
- Handle failed and retried billing jobs safely.
- Maintain billing execution logs.

### 14.3 Idempotency

Operations that may be retried, particularly invoice generation and payment recording, must support idempotency.

Use unique billing-period constraints and idempotency keys where appropriate.

### 14.4 Authorization

- Customers can only access their own records.
- Staff cannot create other staff accounts.
- Only admins can configure discounts, products and plans.
- Backend permissions are authoritative; frontend visibility is not a security boundary.

### 14.5 Database Integrity

- Use database transactions for financial operations.
- Protect records referenced by invoices and subscriptions.
- Avoid deleting historical financial records.
- Maintain auditable payment and invoice changes.

---

## 15. API Documentation & Testing

Interactive API documentation will be provided through:

`GET /api/docs/`

OpenAPI schema:

`GET /api/schema/`

Recommended tools:

- drf-spectacular — OpenAPI generation.
- Swagger UI — API exploration.
- Postman — API testing.
- Pytest — Backend tests.
- Django REST Framework APIClient — Automated endpoint testing.

---

## 16. Sprint-wise API Implementation

| Sprint | API Scope |
|---|---|
| Sprint 1 | Backend health check and infrastructure |
| Sprint 2 | Authentication, users and roles |
| Sprint 3 | Products, variants and plans |
| Sprint 4 | Quotations and subscriptions |
| Sprint 5 | Invoices, taxes and recurring billing |
| Sprint 6 | Discounts and payments |
| Sprint 7 | Analytics and customer portal |
| Sprint 8 | Integration, testing and optimization |

---

## 17. Contract Change Management

This document is the shared source of truth for frontend and backend integration.

Any change to an endpoint, field, data type, permission or response structure must:

1. Be discussed between the frontend and backend owners.
2. Be updated in this document.
3. Be reflected in the OpenAPI specification.
4. Be communicated through a GitHub issue or Pull Request.
5. Be reviewed before merging into the development branch.

Breaking API changes should be avoided within the same API version unless both frontend and backend are updated together.

---

## Document Ownership

| Responsibility | Owner |
|---|---|
| API architecture and implementation | Jeevandas |
| Frontend integration and contract review | Amal Mehabin |
| Documentation and validation | Joseph |

**Document Status:** Draft — Sprint 0  
**API Namespace:** `/api/v1/`  
**Last Updated:** 2026-10-31

