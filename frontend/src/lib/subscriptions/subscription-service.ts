import { z } from "zod";
import { mockSubscriptions, subscriptionStorageKey } from "@/data/mock-subscriptions";
import { getCustomerById } from "@/lib/customers/customer-service";
import { getPlanById } from "@/lib/plans/plan-service";
import { getProductById } from "@/lib/products/product-service";
import { getVariants } from "@/lib/products/variant-service";
import { getQuotationById, markQuotationConverted } from "@/lib/quotations/quotation-service";
import type {
  Subscription,
  SubscriptionAction,
  SubscriptionCreatePayload,
  SubscriptionLineInput,
  SubscriptionUpdatePayload,
} from "@/types/subscription";

const subscriptionLineSchema = z.object({
  id: z.string(),
  product_id: z.number().int().positive(),
  variant_id: z.number().int().positive().nullable(),
  quantity: z.number().int().positive(),
  unit_price: z.string().regex(/^\d+\.\d{2}$/),
  line_total: z.string().regex(/^\d+\.\d{2}$/),
});

const subscriptionSchema = z.object({
  id: z.number().int().positive(),
  subscription_number: z.string().min(1),
  customer_id: z.string().min(1),
  plan_id: z.number().int().positive(),
  quotation_id: z.number().int().positive().nullable(),
  status: z.enum(["draft", "quotation", "confirmed", "active", "paused", "closed"]),
  start_date: z.string(),
  expiry_date: z.string().nullable(),
  next_billing_date: z.string().nullable(),
  payment_terms: z.string(),
  lines: z.array(subscriptionLineSchema).min(1),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
});

function validateDateRange(startDate: string, expiryDate: string | null) {
  const isValidDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
  if (!isValidDate(startDate)) throw new Error("Choose a valid subscription start date.");
  if (expiryDate !== null && !isValidDate(expiryDate)) throw new Error("Choose a valid subscription expiry date.");
  if (expiryDate !== null && expiryDate < startDate) {
    throw new Error("Subscription expiry must be on or after the start date.");
  }
}

function readSubscriptions(): Subscription[] {
  const stored = window.localStorage.getItem(subscriptionStorageKey);
  if (stored === null) return mockSubscriptions.map((subscription) => ({ ...subscription, lines: subscription.lines.map((line) => ({ ...line })) }));

  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    throw new Error("Saved subscription data is unreadable. Clear this browser's Subflow subscription data to restore the samples.", { cause: error });
  }
  const parsed = z.array(subscriptionSchema).safeParse(value);
  if (!parsed.success) {
    throw new Error("Saved subscription data is invalid. Clear this browser's Subflow subscription data to restore the samples.");
  }
  return parsed.data;
}

function saveSubscriptions(subscriptions: Subscription[]) {
  window.localStorage.setItem(subscriptionStorageKey, JSON.stringify(subscriptions));
}

function makeLines(lines: SubscriptionLineInput[]) {
  const mapped = lines.map((line, index) => {
    const unitCents = Math.round(Number(line.unit_price) * 100);
    return {
      ...line,
      id: `line-${crypto.randomUUID()}-${index}`,
      unit_price: (unitCents / 100).toFixed(2),
      line_total: ((unitCents * line.quantity) / 100).toFixed(2),
    };
  });
  for (const line of mapped) {
    if (!getProductById(line.product_id)) throw new Error("A selected product is no longer available.");
    if (line.variant_id !== null && !getVariants(line.product_id).some((variant) => variant.id === line.variant_id)) {
      throw new Error("A selected product variant is no longer available.");
    }
  }
  return mapped;
}

export function getSubscriptions(): Subscription[] {
  return readSubscriptions().sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export function getSubscriptionById(id: number): Subscription | undefined {
  return readSubscriptions().find((subscription) => subscription.id === id);
}

export function createSubscription(data: SubscriptionCreatePayload): Subscription {
  validateDateRange(data.start_date, data.expiry_date);
  if (!getCustomerById(data.customer_id)) throw new Error("The selected customer could not be found.");
  const plan = getPlanById(data.plan_id);
  if (!plan) throw new Error("The selected plan could not be found.");
  const lines = makeLines(data.lines);
  if (lines.some((line) => line.quantity < plan.minimum_quantity)) {
    throw new Error(`Each subscription line must have a quantity of at least ${plan.minimum_quantity}.`);
  }

  const subscriptions = readSubscriptions();
  if (data.quotation_id !== undefined && data.quotation_id !== null) {
    const existing = subscriptions.find((subscription) => subscription.quotation_id === data.quotation_id);
    if (existing) throw new Error("This quotation already has a linked subscription.");
  }
  const id = Math.max(0, ...subscriptions.map((subscription) => subscription.id)) + 1;
  const now = new Date().toISOString();
  const subscription: Subscription = {
    id,
    subscription_number: `SUB-${new Date().getFullYear()}-${String(id).padStart(5, "0")}`,
    customer_id: data.customer_id,
    plan_id: data.plan_id,
    quotation_id: data.quotation_id ?? null,
    status: "draft",
    start_date: data.start_date,
    expiry_date: data.expiry_date,
    next_billing_date: data.start_date,
    payment_terms: data.payment_terms.trim(),
    lines,
    created_at: now,
    updated_at: now,
    closed_at: null,
  };
  saveSubscriptions([subscription, ...subscriptions]);
  return subscription;
}

export function updateSubscription(
  id: number,
  data: SubscriptionUpdatePayload,
): Subscription {
  const subscriptions = readSubscriptions();
  const existing = subscriptions.find((subscription) => subscription.id === id);
  if (!existing) throw new Error("This subscription could not be found.");
  if (existing.status !== "draft" && existing.status !== "quotation") {
    throw new Error("Only draft or quotation subscriptions can be edited in this demo workflow.");
  }
  const lines = data.lines ? makeLines(data.lines) : existing.lines;
  const startDate = data.start_date ?? existing.start_date;
  const expiryDate = data.expiry_date === undefined ? existing.expiry_date : data.expiry_date;
  validateDateRange(startDate, expiryDate);
  const plan = getPlanById(existing.plan_id);
  if (!plan) throw new Error("The subscription plan could not be found.");
  if (lines.some((line) => line.quantity < plan.minimum_quantity)) {
    throw new Error(`Each subscription line must have a quantity of at least ${plan.minimum_quantity}.`);
  }
  const updated: Subscription = {
    ...existing,
    ...data,
    start_date: startDate,
    expiry_date: expiryDate,
    next_billing_date: startDate,
    lines,
    updated_at: new Date().toISOString(),
  };
  saveSubscriptions(subscriptions.map((subscription) => (subscription.id === id ? updated : subscription)));
  return updated;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addInterval(dateValue: string, interval: "daily" | "weekly" | "monthly" | "yearly", count: number) {
  const date = new Date(`${dateValue}T12:00:00.000Z`);
  if (interval === "daily") date.setUTCDate(date.getUTCDate() + count);
  if (interval === "weekly") date.setUTCDate(date.getUTCDate() + count * 7);
  if (interval === "monthly" || interval === "yearly") {
    const day = date.getUTCDate();
    date.setUTCDate(1);
    if (interval === "monthly") date.setUTCMonth(date.getUTCMonth() + count);
    else date.setUTCFullYear(date.getUTCFullYear() + count);
    date.setUTCDate(Math.min(day, new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()));
  }
  return dateOnly(date);
}

function transition(
  subscription: Subscription,
  action: SubscriptionAction,
): Subscription {
  const plan = getPlanById(subscription.plan_id);
  if (!plan) throw new Error("The subscription plan could not be found.");
  const now = new Date().toISOString();

  switch (action) {
    case "confirm":
      if (subscription.status !== "draft" && subscription.status !== "quotation") {
        throw new Error("Only draft or quotation subscriptions can be confirmed.");
      }
      return { ...subscription, status: "confirmed", updated_at: now };
    case "pause":
      if (subscription.status !== "active") throw new Error("Only active subscriptions can be paused.");
      if (!plan.allow_pause) throw new Error("This plan does not allow subscriptions to be paused.");
      return { ...subscription, status: "paused", updated_at: now };
    case "resume":
      if (subscription.status !== "paused") throw new Error("Only paused subscriptions can be resumed.");
      if (!plan.allow_pause) throw new Error("This plan does not allow subscriptions to be resumed.");
      return { ...subscription, status: "active", updated_at: now };
    case "renew": {
      if (subscription.status !== "active") throw new Error("Only active subscriptions can be renewed.");
      if (!plan.allow_renewal) throw new Error("This plan does not allow renewals.");
      const base = subscription.expiry_date ?? subscription.next_billing_date ?? dateOnly(new Date());
      const expiry = addInterval(base, plan.billing_interval, plan.billing_interval_count);
      return {
        ...subscription,
        expiry_date: expiry,
        next_billing_date: expiry,
        updated_at: now,
      };
    }
    case "close": {
      if (subscription.status === "closed" || subscription.status === "draft" || subscription.status === "quotation") {
        throw new Error("Only confirmed, active, or paused subscriptions can be closed.");
      }
      if (
        subscription.expiry_date &&
        subscription.expiry_date > dateOnly(new Date()) &&
        !plan.allow_early_close
      ) {
        throw new Error("This plan does not allow early closure.");
      }
      return { ...subscription, status: "closed", closed_at: now, next_billing_date: null, updated_at: now };
    }
  }
}

export function performSubscriptionAction(
  id: number,
  action: SubscriptionAction,
): Subscription {
  const subscriptions = readSubscriptions();
  const existing = subscriptions.find((subscription) => subscription.id === id);
  if (!existing) throw new Error("This subscription could not be found.");
  const updated = transition(existing, action);
  saveSubscriptions(subscriptions.map((subscription) => (subscription.id === id ? updated : subscription)));
  return updated;
}

export function convertQuotationToSubscription(
  quotationId: number,
  startDate: string,
  expiryDate: string,
): Subscription {
  const quotation = getQuotationById(quotationId);
  if (!quotation) throw new Error("This quotation could not be found.");
  if (quotation.status !== "accepted") throw new Error("Only accepted quotations can be converted.");
  if (quotation.converted_subscription_id !== null) throw new Error("This quotation has already been converted.");
  if (quotation.valid_until < dateOnly(new Date())) throw new Error("This quotation has expired and cannot be converted.");
  if (new Set(quotation.lines.map((line) => line.plan_id)).size !== 1) {
    throw new Error("This demo can convert only quotations whose line items use the same subscription plan.");
  }
  if (expiryDate < startDate) throw new Error("Subscription expiry must be on or after the start date.");
  const subscriptions = readSubscriptions();
  if (subscriptions.some((subscription) => subscription.quotation_id === quotationId)) {
    throw new Error("This quotation already has a linked subscription.");
  }
  const payload: SubscriptionCreatePayload = {
    customer_id: quotation.customer_id,
    plan_id: quotation.lines[0].plan_id,
    start_date: startDate,
    expiry_date: expiryDate,
    payment_terms: quotation.payment_terms,
    lines: quotation.lines.map(({ product_id, variant_id, quantity, unit_price }) => ({
      product_id,
      variant_id,
      quantity,
      unit_price,
    })),
    quotation_id: quotationId,
  };
  const subscription = createSubscription(payload);
  const confirmed: Subscription = {
    ...subscription,
    status: "confirmed",
    updated_at: new Date().toISOString(),
  };
  try {
    const afterCreation = readSubscriptions();
    saveSubscriptions(afterCreation.map((record) => record.id === confirmed.id ? confirmed : record));
    markQuotationConverted(quotationId, subscription.id);
  } catch (error) {
    try {
      const remaining = readSubscriptions().filter((record) => record.id !== subscription.id);
      saveSubscriptions(remaining);
    } catch (rollbackError) {
      throw new Error(
        "Quotation conversion failed and the new demo subscription could not be rolled back.",
        { cause: new AggregateError([error, rollbackError], "Conversion and rollback both failed.") },
      );
    }
    throw error;
  }
  return confirmed;
}
