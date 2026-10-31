# Frontend Design System & UI/UX Specification

**Project:** Subscription Management System\
**Working product identity:** Subflow (placeholder --- rename if the
team chooses another name)\
**Document type:** Frontend design specification\
**Status:** Proposed\
**Owner:** Amal Mehabin --- Frontend Engineer\
**Stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui

------------------------------------------------------------------------

## 1. Design Vision

The application should feel like a premium B2B SaaS platform for
subscription operations and financial management.

The visual direction takes inspiration from the clarity of modern
financial products and the productivity-focused layouts of tools such as
Stripe, Linear, and Vercel. It should not copy their interfaces. The
goal is to establish a distinct product identity that is calm, precise,
trustworthy, and efficient.

### Core design principles

1.  **Clarity over decoration:** Prioritize readable information,
    predictable layouts, and clear actions.
2.  **Financial trust:** Present money, billing dates, invoice states,
    and balances consistently.
3.  **Action-oriented dashboards:** Help users identify what needs
    attention and what to do next.
4.  **Consistent interaction:** Reuse the same patterns for tables,
    forms, dialogs, filters, and status indicators.
5.  **Progressive complexity:** Keep common workflows simple while
    allowing detailed information on dedicated pages.
6.  **Accessible by default:** Use sufficient contrast, keyboard
    navigation, clear focus states, and meaningful labels.
7.  **Responsive behavior:** Optimize for desktop business workflows
    while keeping essential tasks usable on tablets and mobile devices.

### Product experience statement

> A business should be able to understand its subscription health,
> identify billing issues, and complete routine subscription operations
> without navigating through disconnected screens.

------------------------------------------------------------------------

## 2. Brand and Visual Identity

### Working identity

-   **Product name:** Subflow (temporary working name)
-   **Product category:** Subscription and recurring revenue management
-   **Personality:** Professional, focused, dependable, modern
-   **Visual tone:** Minimal B2B SaaS, data-oriented, understated

Avoid excessive gradients, oversized decorative illustrations, strong
shadows, glassmorphism, and unnecessary animation. The product should
look like dependable business software rather than a marketing landing
page.

------------------------------------------------------------------------

## 3. Color System

Use a light-first interface. Colors should communicate hierarchy and
state, not decorate every component.

### 3.1 Core palette

  -----------------------------------------------------------------------
  Token                   Hex                     Usage
  ----------------------- ----------------------- -----------------------
  `primary`               `#635BFF`               Primary buttons, links,
                                                  selected controls, key
                                                  accents

  `primary-hover`         `#5148E5`               Hover state for primary
                                                  actions

  `primary-subtle`        `#F0EFFF`               Selected navigation
                                                  background and subtle
                                                  accent surfaces

  `sidebar`               `#111827`               Main desktop sidebar
                                                  background

  `sidebar-muted`         `#9CA3AF`               Secondary sidebar text
                                                  and icons

  `background`            `#F8FAFC`               Main application
                                                  background

  `surface`               `#FFFFFF`               Cards, dialogs, tables,
                                                  drawers

  `surface-muted`         `#F1F5F9`               Secondary panels and
                                                  muted sections

  `border`                `#E2E8F0`               Default borders and
                                                  dividers

  `text-primary`          `#0F172A`               Headings and primary
                                                  content

  `text-secondary`        `#475569`               Body text and
                                                  descriptions

  `text-muted`            `#64748B`               Supporting labels and
                                                  metadata

  `focus-ring`            `#A5B4FC`               Keyboard focus
                                                  indicator
  -----------------------------------------------------------------------

### 3.2 Semantic colors

  Token              Hex         Meaning
  ------------------ ----------- -----------------------------------------------
  `success`          `#16A34A`   Paid, active, completed, successful
  `success-subtle`   `#DCFCE7`   Success badge background
  `warning`          `#D97706`   Pending, expiring soon, requires review
  `warning-subtle`   `#FEF3C7`   Warning badge background
  `danger`           `#DC2626`   Overdue, failed, rejected, destructive action
  `danger-subtle`    `#FEE2E2`   Error badge background
  `info`             `#2563EB`   Confirmed, informational, in-progress
  `info-subtle`      `#DBEAFE`   Informational badge background
  `neutral`          `#64748B`   Draft, inactive, closed, unspecified
  `neutral-subtle`   `#F1F5F9`   Neutral badge background

### 3.3 Color usage rules

-   Use the primary accent sparingly. It should identify the most
    important action or selected state.
-   Do not use semantic colors as large page backgrounds.
-   Always pair status colors with readable text labels; never
    communicate status through color alone.
-   Keep destructive actions visually distinct and require confirmation
    where data or financial records may be affected.
-   Maintain accessible text contrast. Verify actual component
    combinations before release.
-   Do not assign different meanings to the same color in different
    modules.

### 3.4 Dark mode

Dark mode is optional and should not delay the first functional release.
If implemented, define a separate semantic token set rather than
applying CSS filters or simply inverting colors. Financial charts,
status badges, tables, and form controls must all be checked in both
themes.

------------------------------------------------------------------------

## 4. Typography

### Font family

Use **Geist** as the preferred interface font. If Geist is not available
in the project, use **Inter**.

Recommended fallback:

``` css
font-family: Geist, Inter, ui-sans-serif, system-ui, sans-serif;
```

Use a consistent font family throughout the application. Avoid mixing
display fonts with interface fonts.

### Type scale

  Element                 Size   Weight   Line height
  ----------------- ---------- -------- -------------
  Page title          24--28px      600          1.25
  Section heading     16--18px      600           1.4
  Card heading        14--16px      600           1.4
  Body text               14px      400           1.5
  Table text          13--14px      400          1.45
  Form label              13px      500           1.4
  Supporting text         12px      400          1.45
  Metric value        26--32px      600          1.15
  Button text         13--14px      500             1

### Typography rules

-   Use sentence case for page titles, buttons, tabs, and navigation.
-   Avoid all-caps headings except for small, optional navigation group
    labels.
-   Use tabular numerals for currency, totals, dates, and other aligned
    numeric values.
-   Keep paragraph line lengths comfortable; avoid wide blocks of dense
    explanatory text.
-   Use weight and spacing before introducing additional colors.

------------------------------------------------------------------------

## 5. Layout and Spacing

### 5.1 Application shell

The authenticated application uses a consistent shell:

``` text
┌────────────────────────────────────────────────────────────────────┐
│ Sidebar      │ Top bar: Search, help, notifications, profile       │
│              ├─────────────────────────────────────────────────────┤
│ Navigation   │ Breadcrumbs / Page title / Primary action            │
│              │                                                       │
│              │ Main page content                                    │
│              │                                                       │
│              │ Tables, charts, forms, detail panels                  │
│              │                                                       │
└────────────────────────────────────────────────────────────────────┘
```

### 5.2 Dimensions

  Element                         Desktop guideline
  ----------------------------- -------------------
  Expanded sidebar                       240--256px
  Collapsed sidebar                        64--72px
  Top bar                                  60--68px
  Main content max width                     1440px
  Main content padding                     24--32px
  Card padding                             20--24px
  Standard control height                  36--40px
  Large primary button height              40--44px
  Table row height                         48--56px

These are design guidelines, not rigid requirements. Adjust them where
content density or accessibility requires it.

### 5.3 Spacing scale

Use a consistent 4px-based spacing scale:

  Token          Value Typical use
  ------------ ------- ----------------------------
  `space-1`        4px Icon-to-label gap
  `space-2`        8px Compact internal spacing
  `space-3`       12px Form and table spacing
  `space-4`       16px Standard component spacing
  `space-5`       20px Card internal spacing
  `space-6`       24px Section spacing
  `space-8`       32px Major layout spacing
  `space-10`      40px Large section separation
  `space-12`      48px Page-level separation

### 5.4 Surface treatment

-   Use white surfaces on a soft off-white application background.
-   Prefer thin borders over heavy shadows.
-   Use a subtle shadow only when a component needs elevation, such as a
    popover or floating menu.
-   Use consistent corner radii:
    -   Inputs and buttons: 8px
    -   Cards and dialogs: 12px
    -   Large panels: 14--16px
    -   Pills and badges: fully rounded where appropriate

------------------------------------------------------------------------

## 6. Navigation and Information Architecture

Navigation should reflect business workflows rather than technical
backend modules.

### Admin navigation

``` text
OVERVIEW
  Dashboard

MANAGEMENT
  Customers
  Products
  Plans
  Quotations
  Subscriptions

FINANCE
  Invoices
  Payments
  Discounts

INSIGHTS
  Analytics
  Reports

CONFIGURATION
  Team & Access
  Settings
```

### Staff navigation

Staff should see the operational areas they are permitted to use:

``` text
WORKSPACE
  Dashboard
  Customers
  Quotations
  Subscriptions

FINANCE
  Invoices
  Payments

ACCOUNT
  Profile
  Settings (permitted settings only)
```

The actual menu must be derived from backend permissions and the agreed
role policy. Hiding a menu item is not a security boundary; APIs must
enforce authorization.

### Customer navigation

``` text
MY ACCOUNT
  Overview
  My Subscriptions
  My Invoices
  Payment History
  Profile
```

### Navigation behavior

-   Clearly highlight the active route.
-   Keep navigation labels visible on desktop.
-   Use tooltips when the sidebar is collapsed.
-   Use a drawer on mobile.
-   Preserve navigation context when opening detail pages.
-   Include breadcrumbs on deeply nested management pages where they
    help users understand location.

------------------------------------------------------------------------

## 7. Dashboard Design

The admin dashboard is the main financial and operational overview. It
should answer:

1.  How is recurring revenue performing?
2.  How many subscriptions are active?
3.  What money is outstanding?
4.  Which operational issues need attention?

### 7.1 Page header

Include:

-   Workspace or business name.
-   Page title and concise description.
-   Reporting period selector.
-   Export action, if supported.
-   Primary action: `Create subscription`.

### 7.2 Key metric cards

Recommended metrics:

  -----------------------------------------------------------------------
  Metric                              Definition / note
  ----------------------------------- -----------------------------------
  Monthly Recurring Revenue (MRR)     Recurring revenue normalized to a
                                      monthly value, according to the
                                      agreed backend definition

  Active subscriptions                Count of subscriptions considered
                                      active by backend rules

  Outstanding revenue                 Unpaid invoice balance, not the
                                      total face value of all invoices

  Collection rate                     Collected amount divided by the
                                      relevant invoiced amount for the
                                      selected period
  -----------------------------------------------------------------------

Each card may include: - Metric label. - Prominent value. - Comparison
period, if the backend supplies it. - Small trend visualization, only
when meaningful historical data exists.

Do not invent percentage changes or derive authoritative financial
metrics from incomplete frontend records.

### 7.3 Revenue chart

Provide a primary revenue chart with a clear period selector. Possible
series include collected revenue, recurring revenue, and outstanding
amounts, but only show series that the backend can define consistently.

Recommended periods: - 7 days - 30 days - 90 days - 12 months

Charts must include readable axes, tooltips, legends, empty states, and
accessible text summaries.

### 7.4 Subscription health

Show a breakdown of supported subscription states, such as: - Active -
Confirmed - Paused - Closed

Only include states that exist in the backend model. If the system
supports expiry or renewal warnings, show those as separate operational
indicators rather than inventing new lifecycle states.

### 7.5 Needs Attention panel

This is a signature dashboard feature. It surfaces actionable work
rather than another passive activity feed.

Example items:

``` text
NEEDS ATTENTION

4 invoices overdue
₹18,500 outstanding
[Review invoices]

3 subscriptions expiring soon
Review upcoming subscription end dates
[View subscriptions]

2 quotations awaiting response
Follow up before their validity expires
[View quotations]
```

All counts, amounts, and actions must be driven by real API data. Each
item should link to a filtered view or relevant detail page.

### 7.6 Recent activity

Show a chronological feed of meaningful events, such as: - Subscription
activated. - Invoice generated. - Payment recorded. - Quotation
converted. - Subscription paused or resumed.

Display the event, related customer or record, timestamp, and actor
where available.

------------------------------------------------------------------------

## 8. Page-Level Design Patterns

### 8.1 List pages

Use a consistent structure:

1.  Breadcrumbs, where appropriate.
2.  Page title and description.
3.  Primary create action.
4.  Summary metrics only when they add useful context.
5.  Search and filter toolbar.
6.  Data table.
7.  Pagination and result count.

Data tables should support: - Loading skeletons. - Empty states. - Error
states with retry. - Sorting where relevant. - Search and filtering. -
Pagination. - Row-level actions. - Responsive overflow or a mobile
alternative.

Do not overload every list page with summary cards. The table is often
the primary content.

### 8.2 Detail pages

Use a shared detail-page pattern:

-   Record identity and status.
-   Primary actions.
-   Key information summary.
-   Tabs for related records.
-   Activity or audit timeline.
-   Related financial information where applicable.

### 8.3 Forms

-   Use visible labels; do not rely on placeholders as labels.
-   Group related fields into sections.
-   Explain unusual or financial fields with concise helper text.
-   Validate on the client for usability and on the backend for
    correctness.
-   Preserve user input after recoverable errors.
-   Disable duplicate submissions while a request is in progress.
-   Show field-level errors and a clear submission result.
-   Confirm destructive or financially consequential actions.

### 8.4 Drawers, dialogs, and pages

  -----------------------------------------------------------------------
  Interaction                         Preferred pattern
  ----------------------------------- -----------------------------------
  Quick edit of a simple record       Side drawer

  Short confirmation                  Dialog

  Record payment                      Dialog or focused page, depending
                                      on required fields

  Create quotation                    Full-page editor

  Create subscription                 Multi-step form or focused page

  View invoice                        Dedicated detail page

  View customer                       Dedicated detail page

  Destructive action                  Confirmation dialog
  -----------------------------------------------------------------------

Use a drawer only when the user benefits from retaining the list
context. Complex workflows should have enough space to remain
understandable.

------------------------------------------------------------------------

## 9. Module-Specific Design

### 9.1 Customers

**Customer list columns:** - Customer name. - Email. - Customer type, if
supported. - Active subscriptions. - Outstanding balance. - Account
status.

**Customer detail tabs:** - Overview - Subscriptions - Invoices -
Payments - Activity

The customer overview should provide contact details and a concise
account summary. Restrict access to customer records according to role
and ownership permissions.

### 9.2 Products and variants

**Product list columns:** - Product name. - SKU or identifier, if
supported. - Variant count. - Sales price. - Cost price, visible only to
permitted roles. - Availability. - Status.

**Product form sections:** 1. Basic information. 2. Pricing. 3.
Variants. 4. Availability. 5. Additional settings.

Clearly distinguish sales price from cost price. Do not expose cost
price to customer-facing views.

### 9.3 Subscription plans

Display plans in a table by default, with an optional compact card view
if it improves comparison.

Show: - Plan name. - Associated product. - Price. - Billing interval. -
Minimum quantity. - Availability. - Status.

The plan form should make billing interval and price easy to understand.
Supported intervals must match the backend contract.

### 9.4 Quotations

Quotation list columns: - Quotation number. - Customer. - Created
date. - Valid until. - Total amount. - Status.

Quotation editor: - Customer selection. - Product and plan selection. -
Quantity. - Discounts. - Validity period. - Notes. - Live totals
preview.

Actions should reflect the backend workflow, such as save draft,
preview, share/send if implemented, and convert to subscription if
eligible.

### 9.5 Subscriptions

Subscription list columns: - Subscription ID. - Customer. - Plan. -
Recurring amount. - Billing interval. - Next billing date, if
available. - Status.

Subscription detail should emphasize: - Subscription identity and
status. - Customer and plan. - Recurring amount and billing interval. -
Start and end dates. - Next billing date, if applicable. - Associated
invoices. - Lifecycle history. - Available lifecycle actions.

Use a visual timeline to explain events such as creation, confirmation,
activation, pause, resume, renewal, and closure.

Only display actions permitted by the current state and user
permissions. The backend remains the source of truth for valid
transitions.

### 9.6 Invoices

Invoice list columns: - Invoice number. - Customer. - Issue date. - Due
date. - Total. - Amount paid, if partial payments are supported. -
Balance due. - Status.

Invoice detail should show: - Business and customer details. - Invoice
number and dates. - Line items. - Subtotal. - Discounts. - Tax
breakdown. - Total. - Payments and remaining balance. - Status and
available actions.

Provide a clear PDF preview or download action when PDF generation is
supported.

All monetary totals must come from authoritative backend calculations.
The frontend may format and display them but must not independently
calculate invoice totals.

### 9.7 Payments

Payment overview may include: - Total collected for the selected
period. - Successful payments. - Pending payments, if supported. -
Failed payments, if supported.

Payment table: - Transaction identifier. - Customer. - Related
invoice. - Amount. - Payment method. - Payment date. - Status.

Payment detail should show the reconciliation with the invoice and any
partial-payment information.

### 9.8 Discounts

Show: - Discount name. - Fixed or percentage type. - Discount value. -
Applicable products or plans. - Validity period. - Usage count and
limit, if supported. - Status.

The form should reveal relevant fields based on the discount type.
Clearly explain eligibility conditions and validity.

### 9.9 Analytics and reports

Potential metrics: - MRR and ARR, if the backend supports consistent
definitions. - New subscriptions. - Closed or cancelled subscriptions. -
Revenue collected. - Outstanding balances. - Revenue by product. -
Payment collection trends.

Use charts only when they add analytical value. Every chart must have a
title, time range, units, legend where needed, and an empty state.

### 9.10 Customer portal

The customer portal should be simpler than the admin workspace.

Overview: - Active subscriptions. - Next billing date. - Outstanding
balance. - Recent invoices. - Recent payments.

Navigation: - Overview - My Subscriptions - My Invoices - Payment
History - Profile

Customers must only be able to access their own records. This must be
enforced by backend authorization, not just frontend filtering.

------------------------------------------------------------------------

## 10. Status and Badge System

Use consistent status labels and semantic colors across all modules.

  Status      Visual treatment      Notes
  ----------- --------------------- ----------------------------------
  Active      Green                 Operational subscription
  Confirmed   Blue                  Confirmed record
  Draft       Neutral grey          Not finalized
  Pending     Amber                 Awaiting action
  Paused      Orange                Temporarily inactive
  Overdue     Red                   Payment requires attention
  Paid        Green                 Fully paid invoice
  Closed      Neutral grey          Lifecycle completed
  Cancelled   Neutral grey or red   Cancelled record
  Failed      Red                   Failed transaction, if supported

The final mapping must match actual backend status values. Do not infer
a status from a date or amount in the frontend.

Badges should be compact and text-led. Avoid large, brightly colored
status blocks.

------------------------------------------------------------------------

## 11. Interaction and Usability Standards

### Global search

A keyboard-accessible command palette may be opened with `Ctrl+K` (and
`Cmd+K` on macOS).

Potential search targets: - Customers. - Subscriptions. - Invoices. -
Products. - Quotations.

Search results must respect the current user's permissions. Do not show
actions that the user cannot perform.

### Notifications

Use concise toast notifications for completed actions and recoverable
errors.

Examples: - "Customer created." - "Payment recorded." - "Subscription
updated." - "Unable to save changes. Please try again."

For important failures, provide persistent inline feedback rather than
relying only on a toast that disappears.

### Confirmation

Require confirmation for actions that are destructive or materially
affect billing, such as: - Closing a subscription. - Cancelling an
invoice. - Removing a product that is in use. - Applying a consequential
lifecycle change.

Where appropriate, request a reason and explain the impact before
confirmation.

### Keyboard and focus

-   All interactive controls must be keyboard accessible.
-   Provide visible focus indicators.
-   Maintain logical tab order.
-   Support Escape to close dialogs and popovers where appropriate.
-   Do not trap keyboard focus outside an active modal.
-   Provide accessible names for icon-only buttons.

------------------------------------------------------------------------

## 12. Loading, Empty, Error, and Permission States

Every data-driven page must account for more than the successful state.

### Loading

-   Use skeletons that resemble the final content layout.
-   Avoid blank pages while requests are loading.
-   Prevent duplicate submissions while mutations are pending.

### Empty

Explain why the page is empty and offer a relevant next action when the
user has permission.

Example:

``` text
No subscriptions yet

Subscriptions created for your customers will appear here.

[Create subscription]
```

### Error

-   Explain that the data could not be loaded or saved.
-   Provide a retry action when retrying is safe.
-   Preserve form values after recoverable errors.
-   Do not expose raw stack traces or internal server details.

### Permission denied

Show a clear message when a user cannot access a resource. Do not reveal
sensitive record details in the error state.

------------------------------------------------------------------------

## 13. Responsive Design

Desktop is the primary target for administrative workflows, but all core
experiences should remain usable on smaller screens.

  Breakpoint        Layout behavior
  ----------------- ---------------------------------------------------------
  `>= 1440px`       Full sidebar, spacious dashboard grids
  `1024px–1439px`   Standard sidebar, tighter content spacing
  `768px–1023px`    Collapsible sidebar, fewer dashboard columns
  `< 768px`         Drawer navigation, stacked cards, mobile-friendly forms

Responsive requirements: - Use a navigation drawer on mobile. - Stack
metric cards vertically or in a compact grid. - Allow tables to scroll
horizontally or provide card-based record views. - Keep primary actions
reachable. - Avoid fixed-width forms that overflow. - Ensure dialogs fit
within the viewport. - Do not hide essential invoice or payment
information on mobile.

------------------------------------------------------------------------

## 14. Motion and Micro-interactions

Motion should be subtle and purposeful.

Recommended: - Short hover and focus transitions. - Sidebar
expand/collapse transition. - Drawer and dialog entrance transitions. -
Skeleton loading. - Small chart transitions where they do not distract.

Avoid: - Constantly animated metrics. - Large page transitions. -
Decorative background motion. - Animations that delay user actions.

Respect the user's reduced-motion preference.

------------------------------------------------------------------------

## 15. Frontend Technology and Component Standards

  Concern             Preferred technology
  ------------------- ----------------------------------------
  Framework           Next.js App Router
  Language            TypeScript
  Styling             Tailwind CSS
  UI primitives       shadcn/ui
  Server state        TanStack Query
  Forms               React Hook Form
  Schema validation   Zod
  Tables              TanStack Table
  Charts              Recharts
  Icons               Lucide React
  Notifications       Sonner
  Date utilities      date-fns
  API communication   Fetch or Axios, based on project setup

### Component conventions

Build reusable components for: - Application sidebar and top bar. - Page
headers and breadcrumbs. - Metric cards. - Data tables and filter
toolbars. - Status badges. - Form fields and validation messages. -
Empty, loading, and error states. - Confirmation dialogs. - Detail
drawers. - Currency and date display.

Use feature-oriented components for module-specific behavior. Avoid
building one enormous component that contains the entire page and all
business logic.

### State management

-   Use TanStack Query for server state, caching, and mutations.
-   Keep short-lived UI state local where practical.
-   Avoid duplicating server data in multiple state stores.
-   Centralize API error handling and authentication behavior.
-   Use shared formatters for currency and dates.

### Financial data rules

-   Backend calculations are authoritative.
-   Do not use floating-point arithmetic to recalculate monetary totals
    in the browser.
-   Use the currency and precision supplied by the API or defined by the
    product contract.
-   Format amounts consistently.
-   Clearly distinguish invoice total, amount paid, and balance due.
-   Do not invent MRR, ARR, collection rate, or revenue trends when the
    API does not provide sufficient data.

------------------------------------------------------------------------

## 16. Suggested Frontend Project Structure

Adapt this structure to the repository's existing conventions rather
than restructuring blindly.

``` text
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── plans/
│   │   ├── quotations/
│   │   ├── subscriptions/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── discounts/
│   │   ├── analytics/
│   │   └── settings/
│   ├── (customer)/
│   │   ├── layout.tsx
│   │   ├── overview/
│   │   ├── subscriptions/
│   │   ├── invoices/
│   │   └── payments/
│   └── layout.tsx
├── components/
│   ├── layout/
│   ├── ui/
│   ├── data-table/
│   ├── charts/
│   ├── forms/
│   └── shared/
├── features/
│   ├── dashboard/
│   ├── customers/
│   ├── products/
│   ├── plans/
│   ├── quotations/
│   ├── subscriptions/
│   ├── invoices/
│   ├── payments/
│   ├── discounts/
│   └── analytics/
├── hooks/
├── lib/
│   ├── api-client.ts
│   ├── auth.ts
│   ├── permissions.ts
│   ├── formatters.ts
│   └── utils.ts
├── services/
├── types/
└── styles/
```

------------------------------------------------------------------------

## 17. Sprint-Based Frontend Delivery

The frontend work should follow the team's sprint roadmap.

  -----------------------------------------------------------------------
  Sprint                  Frontend scope          Completion outcome
  ----------------------- ----------------------- -----------------------
  Sprint 0                Confirm design tokens,  Agreed frontend
                          routes, component       blueprint
                          conventions, API        
                          contract dependencies   

  Sprint 1                App shell, sidebar, top Navigable application
                          bar, page header,       foundation
                          dashboard shell         

  Sprint 2                Login, registration,    Authentication
                          password flows,         experience
                          protected layouts,      
                          role-based navigation   

  Sprint 3                Product, variant, and   Catalogue management
                          plan list/detail/forms  

  Sprint 4                Quotation and           Core subscription
                          subscription workflows  operations

  Sprint 5                Invoice list/detail,    Invoice experience
                          invoice preview,        
                          billing history         

  Sprint 6                Discounts, payment      Finance operations
                          recording, payment      
                          history                 

  Sprint 7                Analytics,              Business and customer
                          needs-attention panel,  experiences
                          customer portal         

  Sprint 8                Responsive refinement,  Release-ready frontend
                          integration fixes,      
                          accessibility, visual   
                          consistency             
  -----------------------------------------------------------------------

### Sprint implementation rule

Prioritize: 1. Working navigation and page structure. 2. Correct API
integration. 3. Complete loading, empty, error, and permission states.
4. Form validation and functional interactions. 5. Visual refinement and
responsive polish.

Do not spend the first sprint building elaborate charts or animations
before the application shell and core components work.

------------------------------------------------------------------------

## 18. Frontend Definition of Done

A frontend feature is complete only when the relevant criteria are met:

-   [ ] Page follows the shared design system.
-   [ ] Layout works at supported viewport sizes.
-   [ ] API integration uses the agreed contract.
-   [ ] Loading state is implemented.
-   [ ] Empty state is implemented.
-   [ ] Error state is implemented.
-   [ ] Permission behavior is respected.
-   [ ] Forms have client-side validation and backend error handling.
-   [ ] Monetary values and dates use shared formatters.
-   [ ] All visible actions work.
-   [ ] Keyboard focus and accessible labels are present.
-   [ ] No unintended hardcoded production data remains.
-   [ ] Relevant tests pass.
-   [ ] Changes are reviewed through a pull request.

------------------------------------------------------------------------

## 19. Out of Scope for the Initial Visual Release

To keep the implementation focused, the following should not block the
first usable release:

-   Full dark mode.
-   Complex animated charts.
-   Highly customized data visualization.
-   Advanced command-palette actions.
-   Drag-and-drop dashboard customization.
-   Extensive onboarding tours.
-   Decorative 3D illustrations.
-   Real-time updates unless required by the backend architecture.

These can be considered after core workflows are stable.

------------------------------------------------------------------------

## 20. Final Design Direction

The Subscription Management System should look and behave like a focused
financial operations product.

Its identity should come from: - A restrained indigo and slate color
system. - Strong typography and consistent spacing. - Clear navigation
organized around business tasks. - High-quality tables and financial
detail views. - A dashboard centered on revenue health and actionable
issues. - A visual subscription lifecycle. - Reliable empty, loading,
error, and permission states. - Consistent role-specific experiences.

**Primary design principle:**

> Make complex subscription and billing operations feel clear,
> predictable, and easy to act on.

**Document owner:** Amal Mehabin --- Frontend Engineer\
**Reviewers:** Jeevandas --- Team Lead & Backend Engineer; Joseph ---
QA, Documentation & Development Support\
**Status:** Proposed design specification; align final implementation
with the agreed API contract and repository setup.
