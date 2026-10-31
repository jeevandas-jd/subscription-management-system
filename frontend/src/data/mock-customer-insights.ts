import type { CustomerActivity, CustomerInsight } from "@/types/customer";

const sampleActivities: Record<string, CustomerActivity[]> = {
  "CUS-0001": [
    { id: "acme-1", title: "Payment received", description: "₹12,500 · Invoice INV-2026-1048", timestamp: "2026-10-30T12:15:00.000Z", kind: "payment" },
    { id: "acme-2", title: "Invoice generated", description: "Business plan · October 2026", timestamp: "2026-10-27T09:00:00.000Z", kind: "invoice" },
    { id: "acme-3", title: "Subscription started", description: "Business plan · Monthly", timestamp: "2026-10-14T10:00:00.000Z", kind: "subscription" },
    { id: "acme-4", title: "Customer information updated", description: "Billing contact details were updated", timestamp: "2026-10-10T08:30:00.000Z", kind: "customer" },
  ],
  "CUS-0002": [
    { id: "brightlane-1", title: "Invoice generated", description: "Growth plan · Annual", timestamp: "2026-10-28T10:00:00.000Z", kind: "invoice" },
    { id: "brightlane-2", title: "Subscription started", description: "Growth plan · Annual", timestamp: "2026-10-24T11:00:00.000Z", kind: "subscription" },
    { id: "brightlane-3", title: "Customer created", description: "Customer record added to Subflow", timestamp: "2026-10-24T11:00:00.000Z", kind: "customer" },
  ],
  "CUS-0003": [
    { id: "rohan-1", title: "Payment received", description: "₹4,800 · Invoice INV-2026-1021", timestamp: "2026-10-29T14:10:00.000Z", kind: "payment" },
    { id: "rohan-2", title: "Invoice generated", description: "Starter plan · October 2026", timestamp: "2026-10-24T09:30:00.000Z", kind: "invoice" },
    { id: "rohan-3", title: "Subscription started", description: "Starter plan · Monthly", timestamp: "2026-10-21T08:20:00.000Z", kind: "subscription" },
    { id: "rohan-4", title: "Customer created", description: "Customer record added to Subflow", timestamp: "2026-10-21T08:20:00.000Z", kind: "customer" },
  ],
};

const sampleStats: Record<string, Omit<CustomerInsight, "activity">> = {
  "CUS-0001": { subscriptions: 3, activeSubscriptions: 2, invoices: 18, payments: 16 },
  "CUS-0002": { subscriptions: 1, activeSubscriptions: 1, invoices: 1, payments: 1 },
  "CUS-0003": { subscriptions: 1, activeSubscriptions: 1, invoices: 2, payments: 2 },
  "CUS-0004": { subscriptions: 2, activeSubscriptions: 2, invoices: 12, payments: 12 },
  "CUS-0005": { subscriptions: 2, activeSubscriptions: 1, invoices: 9, payments: 8 },
  "CUS-0006": { subscriptions: 1, activeSubscriptions: 0, invoices: 5, payments: 5 },
  "CUS-0007": { subscriptions: 2, activeSubscriptions: 2, invoices: 7, payments: 6 },
  "CUS-0008": { subscriptions: 1, activeSubscriptions: 1, invoices: 11, payments: 10 },
  "CUS-0009": { subscriptions: 1, activeSubscriptions: 0, invoices: 3, payments: 3 },
  "CUS-0010": { subscriptions: 1, activeSubscriptions: 1, invoices: 4, payments: 4 },
  "CUS-0011": { subscriptions: 2, activeSubscriptions: 2, invoices: 8, payments: 8 },
  "CUS-0012": { subscriptions: 1, activeSubscriptions: 0, invoices: 2, payments: 2 },
};

export function getCustomerInsight(id: string): CustomerInsight {
  const activity = sampleActivities[id];

  if (!activity) {
    return {
      subscriptions: 0,
      activeSubscriptions: 0,
      invoices: 0,
      payments: 0,
      activity: [],
    };
  }

  return {
    ...(sampleStats[id] ?? {
      subscriptions: 0,
      activeSubscriptions: 0,
      invoices: 0,
      payments: 0,
    }),
    activity,
  };
}
