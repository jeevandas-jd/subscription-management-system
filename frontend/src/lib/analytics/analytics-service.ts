import { getCustomers } from "@/lib/customers/customer-service";
import { getInvoiceBalance, getInvoices, getPayments } from "@/lib/finance";
import { getPlanById, getPlans } from "@/lib/plans/plan-service";
import { getSubscriptions } from "@/lib/subscriptions/subscription-service";
import type {
  AnalyticsRange,
  AnalyticsReport,
  AnalyticsSourceData,
  InvoiceStatusPoint,
  PlanBreakdownPoint,
} from "@/types/analytics";
import type { SubscriptionStatus } from "@/types/subscription";

const statusDetails: Record<SubscriptionStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "#94a3b8" },
  quotation: { label: "Quotation", color: "#8b5cf6" },
  confirmed: { label: "Confirmed", color: "#3b82f6" },
  active: { label: "Active", color: "#22c5a5" },
  paused: { label: "Paused", color: "#f59e0b" },
  closed: { label: "Closed", color: "#cbd5e1" },
};

export function getAnalyticsSourceData(): AnalyticsSourceData {
  const customers = getCustomers();
  const subscriptions = getSubscriptions();
  let finance: AnalyticsSourceData["finance"] = null;
  let financeError: string | null = null;

  try {
    finance = {
      invoices: getInvoices(),
      payments: getPayments(),
    };
  } catch (error) {
    financeError = error instanceof Error
      ? error.message
      : "Invoice and payment demo data could not be loaded.";
  }

  return {
    customers,
    subscriptions,
    finance,
    financeError,
  };
}

function isWithinRange(value: string, start: number, end: number) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp >= start && timestamp <= end;
}

function amountCents(amount: string) {
  const cents = Math.round(Number(amount) * 100);
  return Number.isSafeInteger(cents) ? cents : 0;
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function calculateAnalyticsReport(
  data: AnalyticsSourceData,
  range: AnalyticsRange,
  now = new Date(),
): AnalyticsReport {
  const monthCount = Number(range);
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthCount + 1, 1));
  const startTimestamp = start.getTime();
  const endTimestamp = now.getTime();
  const today = now.toISOString().slice(0, 10);

  const months = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
    return {
      month: monthLabel(date),
      monthKey: monthKey(date),
      revenueCents: 0,
      payments: 0,
      subscriptions: 0,
    };
  });
  const monthByKey = new Map(months.map((month) => [month.monthKey, month]));

  // Subscriptions in range
  const subscriptionsInRange = data.subscriptions.filter((subscription) =>
    isWithinRange(subscription.created_at, startTimestamp, endTimestamp),
  );

  for (const subscription of subscriptionsInRange) {
    const date = new Date(subscription.created_at);
    const bucket = monthByKey.get(monthKey(date));
    if (bucket) {
      bucket.subscriptions += 1;
    }
  }

  // Payments in range
  const paymentsInRange = data.finance?.payments.filter((payment) =>
    payment.status === "recorded" &&
    isWithinRange(payment.payment_date, startTimestamp, endTimestamp),
  ) ?? null;

  for (const payment of paymentsInRange ?? []) {
    const date = new Date(payment.payment_date);
    const bucket = monthByKey.get(monthKey(date));
    if (!bucket) continue;
    bucket.revenueCents += amountCents(payment.amount);
    bucket.payments += 1;
  }

  // Subscription status counts in range
  const statusCounts = new Map<SubscriptionStatus, number>();
  for (const status of Object.keys(statusDetails) as SubscriptionStatus[]) {
    statusCounts.set(status, 0);
  }
  for (const subscription of subscriptionsInRange) {
    statusCounts.set(subscription.status, (statusCounts.get(subscription.status) ?? 0) + 1);
  }

  // Open invoices & balances
  const openInvoices = data.finance?.invoices.filter(
    (invoice) => invoice.status === "confirmed" && getInvoiceBalance(invoice) > 0,
  ) ?? null;

  // Active subscriptions & MRR calculation
  const activeSubs = data.subscriptions.filter((s) => s.status === "active");
  const mrrCents = activeSubs.reduce((sum, s) => {
    const plan = getPlanById(s.plan_id);
    const lineTotal = s.lines.reduce(
      (lSum, l) => lSum + Math.round(Number(l.unit_price) * 100) * l.quantity,
      0,
    );
    const interval = plan?.billing_interval ?? "monthly";
    const count = Math.max(1, plan?.billing_interval_count ?? 1);
    let monthlyRate = lineTotal;
    if (interval === "yearly") {
      monthlyRate = Math.round(lineTotal / (12 * count));
    } else if (interval === "weekly") {
      monthlyRate = Math.round((lineTotal * 52) / (12 * count));
    } else if (interval === "daily") {
      monthlyRate = Math.round((lineTotal * 30) / count);
    } else {
      monthlyRate = Math.round(lineTotal / count);
    }
    return sum + monthlyRate;
  }, 0);

  // Churned subscriptions
  const churnedSubscriptions = data.subscriptions.filter((s) => s.status === "closed").length;

  // Invoice status distribution
  const allInvoices = data.finance?.invoices ?? [];
  const paidCount = allInvoices.filter((inv) => inv.status === "paid").length;
  const overdueCount = allInvoices.filter(
    (inv) => inv.status === "confirmed" && inv.due_date < today && getInvoiceBalance(inv) > 0,
  ).length;
  const openCount = allInvoices.filter(
    (inv) => inv.status === "confirmed" && (inv.due_date >= today || getInvoiceBalance(inv) === 0),
  ).length;
  const draftCount = allInvoices.filter((inv) => inv.status === "draft").length;
  const cancelledCount = allInvoices.filter((inv) => inv.status === "cancelled").length;

  const invoiceStatuses: InvoiceStatusPoint[] = [
    { name: "paid", label: "Paid", value: paidCount, color: "#10b981" },
    { name: "open", label: "Open / Due", value: openCount, color: "#3b82f6" },
    { name: "overdue", label: "Overdue", value: overdueCount, color: "#f43f5e" },
    { name: "draft", label: "Draft", value: draftCount, color: "#94a3b8" },
    { name: "cancelled", label: "Cancelled", value: cancelledCount, color: "#cbd5e1" },
  ];

  // Plan popularity & recurring value breakdown
  const plans = getPlans();
  const planBreakdown: PlanBreakdownPoint[] = plans.map((plan) => {
    const subsForPlan = data.subscriptions.filter((s) => s.plan_id === plan.id);
    const recurringCents = subsForPlan.reduce(
      (sum, s) =>
        sum +
        s.lines.reduce(
          (lSum, l) => lSum + Math.round(Number(l.unit_price) * 100) * l.quantity,
          0,
        ),
      0,
    );
    return {
      name: plan.name,
      count: subsForPlan.length,
      recurringCents,
    };
  }).filter((p) => p.count > 0);

  return {
    totalCustomers: data.customers.length,
    activeSubscriptions: activeSubs.length,
    mrrCents,
    newCustomers: data.customers.filter((customer) =>
      isWithinRange(customer.createdAt, startTimestamp, endTimestamp),
    ).length,
    newSubscriptions: subscriptionsInRange.length,
    churnedSubscriptions,
    revenueCents: paymentsInRange?.reduce((total, payment) => total + amountCents(payment.amount), 0) ?? null,
    paymentCount: paymentsInRange?.length ?? null,
    outstandingCents: openInvoices?.reduce((total, invoice) => total + getInvoiceBalance(invoice), 0) ?? null,
    overdueInvoices: openInvoices?.filter((invoice) => invoice.due_date < today).length ?? null,
    months,
    statuses: (Object.keys(statusDetails) as SubscriptionStatus[]).map((status) => ({
      name: status,
      label: statusDetails[status].label,
      value: statusCounts.get(status) ?? 0,
      color: statusDetails[status].color,
    })),
    invoiceStatuses,
    planBreakdown,
    financeError: data.financeError,
    rangeStart: dateLabel(start),
    rangeEnd: dateLabel(new Date(endTimestamp)),
  };
}
