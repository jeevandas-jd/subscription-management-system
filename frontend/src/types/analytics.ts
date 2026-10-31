import type { Customer } from "@/types/customer";
import type { Invoice, Payment } from "@/types/finance";
import type { Subscription, SubscriptionStatus } from "@/types/subscription";

export type AnalyticsRange = "6" | "12";

export type AnalyticsSourceData = {
  customers: Customer[];
  subscriptions: Subscription[];
  finance: {
    invoices: Invoice[];
    payments: Payment[];
  } | null;
  financeError: string | null;
};

export type AnalyticsMonthPoint = {
  month: string;
  monthKey: string;
  revenueCents: number;
  payments: number;
  subscriptions: number;
};

export type AnalyticsStatusPoint = {
  name: SubscriptionStatus;
  label: string;
  value: number;
  color: string;
};

export type InvoiceStatusPoint = {
  name: string;
  label: string;
  value: number;
  color: string;
};

export type PlanBreakdownPoint = {
  name: string;
  count: number;
  recurringCents: number;
};

export type AnalyticsReport = {
  totalCustomers: number;
  activeSubscriptions: number;
  mrrCents: number;
  newCustomers: number;
  newSubscriptions: number;
  churnedSubscriptions: number;
  revenueCents: number | null;
  paymentCount: number | null;
  outstandingCents: number | null;
  overdueInvoices: number | null;
  months: AnalyticsMonthPoint[];
  statuses: AnalyticsStatusPoint[];
  invoiceStatuses: InvoiceStatusPoint[];
  planBreakdown: PlanBreakdownPoint[];
  financeError: string | null;
  rangeStart: string;
  rangeEnd: string;
};
