# Sample Data Specification

Seed data used for development demos and QA. Fixtures or a seed script (for example `backend/management/commands/seed_data`) should implement this spec once `database-schema.md` is final.

## Users
| Role | Email | Notes |
|---|---|---|
| Admin | admin@example.com | Full access |
| Staff | staff1@example.com | Operations |
| Customer | customer1@example.com | Has active and paused subscriptions |
| Customer | customer2@example.com | Has overdue invoice, used for isolation tests |

All passwords are development-only and must never be reused in production.

## Products and variants
| Product | Sales price | Cost price | Variants |
|---|---|---|---|
| Cloud Storage | 10.00 | 4.00 | Basic (+0), Pro (+5.00), Enterprise (+20.00) |
| Project Tool | 15.00 | 6.00 | Standard (+0), Team (+10.00) |
| Support Pack | 25.00 | 10.00 | None |

## Plans
| Plan | Cycle | Minimum quantity | Notes |
|---|---|---|---|
| Daily Trial | Daily | 1 | Short cycle for billing tests |
| Weekly Flex | Weekly | 1 | |
| Monthly Standard | Monthly | 1 | Most common |
| Yearly Saver | Yearly | 2 | Tests minimum quantity |

## Discounts
| Code | Type | Value | Conditions | State |
|---|---|---|---|---|
| WELCOME10 | Percentage | 10% | None | Active |
| FLAT5 | Fixed | 5.00 | Min purchase 30.00 | Active |
| BULK15 | Percentage | 15% | Min quantity 5, Cloud Storage only | Active |
| OLD20 | Percentage | 20% | Expired last month | Expired |
| LIMIT1 | Fixed | 3.00 | Usage limit 1, already used | Exhausted |

## Quotations and subscriptions (one of each state)
- Draft, Quotation (valid), Quotation (expired), Confirmed, Active, Paused, Closed (early), Closed (expired)

## Invoices and payments
- Paid in full
- Partially paid
- Unpaid, not yet due
- Unpaid, overdue
- Cancelled invoice
- Invoice with discount and tax

## Edge cases to include
- Tax rounding case (for example 3 x 3.33 at 18% tax)
- Subscription starting on the 31st (monthly cycle)
- Leap-year yearly renewal (29 Feb)
- Zero-value invoice after a full discount
