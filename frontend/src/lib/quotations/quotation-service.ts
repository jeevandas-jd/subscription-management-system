import { z } from "zod";
import { mockQuotations, quotationStorageKey } from "@/data/mock-quotations";
import { getCustomerById } from "@/lib/customers/customer-service";
import { getProductById } from "@/lib/products/product-service";
import { getVariants } from "@/lib/products/variant-service";
import { getPlanById } from "@/lib/plans/plan-service";
import type {
  Quotation,
  QuotationCreatePayload,
  QuotationLine,
  QuotationUpdatePayload,
} from "@/types/quotation";

const quotationLineSchema = z.object({
  id: z.string(),
  product_id: z.number().int().positive(),
  variant_id: z.number().int().positive().nullable(),
  plan_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unit_price: z.string().regex(/^\d+\.\d{2}$/),
  line_total: z.string().regex(/^\d+\.\d{2}$/),
});

const quotationSchema = z.object({
  id: z.number().int().positive(),
  quotation_number: z.string().min(1),
  customer_id: z.string().min(1),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired", "converted"]),
  valid_until: z.string(),
  payment_terms: z.string(),
  lines: z.array(quotationLineSchema).min(1),
  subtotal: z.string().regex(/^\d+\.\d{2}$/),
  discount_total: z.string().regex(/^\d+\.\d{2}$/),
  tax_total: z.string().regex(/^\d+\.\d{2}$/),
  grand_total: z.string().regex(/^\d+\.\d{2}$/),
  created_at: z.string(),
  updated_at: z.string(),
  converted_subscription_id: z.number().int().positive().nullable(),
});

function readQuotations(): Quotation[] {
  const stored = window.localStorage.getItem(quotationStorageKey);
  if (stored === null) return mockQuotations.map((quotation) => ({ ...quotation, lines: quotation.lines.map((line) => ({ ...line })) }));

  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    throw new Error("Saved quotation data is unreadable. Clear this browser's Subflow quotation data to restore the samples.", { cause: error });
  }
  const parsed = z.array(quotationSchema).safeParse(value);
  if (!parsed.success) {
    throw new Error("Saved quotation data is invalid. Clear this browser's Subflow quotation data to restore the samples.");
  }
  return parsed.data;
}

function saveQuotations(quotations: Quotation[]) {
  window.localStorage.setItem(quotationStorageKey, JSON.stringify(quotations));
}

function validateLineReferences(lines: QuotationLine[]) {
  for (const line of lines) {
    if (!getProductById(line.product_id)) {
      throw new Error("A selected product is no longer available.");
    }
    if (!getPlanById(line.plan_id)) {
      throw new Error("A selected plan is no longer available.");
    }
    if (
      line.variant_id !== null &&
      !getVariants(line.product_id).some((variant) => variant.id === line.variant_id)
    ) {
      throw new Error("A selected product variant is no longer available.");
    }
  }
}

export function calculateQuotationDemoTotals(
  lines: Pick<QuotationLine, "quantity" | "unit_price">[],
): { subtotal: string; discount_total: string; tax_total: string; grand_total: string } {
  const subtotalCents = lines.reduce(
    (total, line) => total + Math.round(Number(line.unit_price) * 100) * line.quantity,
    0,
  );
  const subtotal = (subtotalCents / 100).toFixed(2);
  return {
    subtotal,
    discount_total: "0.00",
    tax_total: "0.00",
    grand_total: subtotal,
  };
}

function makeLines(lines: QuotationCreatePayload["lines"]): QuotationLine[] {
  const mapped = lines.map((line, index) => {
    const unitCents = Math.round(Number(line.unit_price) * 100);
    return {
      ...line,
      id: `line-${crypto.randomUUID()}-${index}`,
      unit_price: (unitCents / 100).toFixed(2),
      line_total: ((unitCents * line.quantity) / 100).toFixed(2),
    };
  });
  validateLineReferences(mapped);
  return mapped;
}

export function getQuotations(): Quotation[] {
  return readQuotations().sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export function getQuotationById(id: number): Quotation | undefined {
  return readQuotations().find((quotation) => quotation.id === id);
}

export function createQuotation(data: QuotationCreatePayload): Quotation {
  if (!getCustomerById(data.customer_id)) throw new Error("The selected customer could not be found.");
  const quotations = readQuotations();
  const lines = makeLines(data.lines);
  const totals = calculateQuotationDemoTotals(lines);
  const now = new Date().toISOString();
  const id = Math.max(0, ...quotations.map((quotation) => quotation.id)) + 1;
  const year = new Date().getFullYear();
  const quotation: Quotation = {
    id,
    quotation_number: `QUO-${year}-${String(id).padStart(5, "0")}`,
    customer_id: data.customer_id,
    status: "draft",
    valid_until: data.valid_until,
    payment_terms: data.payment_terms.trim(),
    lines,
    ...totals,
    created_at: now,
    updated_at: now,
    converted_subscription_id: null,
  };
  saveQuotations([quotation, ...quotations]);
  return quotation;
}

export function updateQuotation(
  id: number,
  data: QuotationUpdatePayload,
): Quotation {
  const quotations = readQuotations();
  const existing = quotations.find((quotation) => quotation.id === id);
  if (!existing) throw new Error("This quotation could not be found.");
  if (existing.status !== "draft") {
    throw new Error("Only draft quotations can be edited in this demo workflow.");
  }

  const customerId = data.customer_id ?? existing.customer_id;
  if (!getCustomerById(customerId)) throw new Error("The selected customer could not be found.");
  const lines = data.lines ? makeLines(data.lines) : existing.lines;
  const totals = calculateQuotationDemoTotals(lines);
  const updated: Quotation = {
    ...existing,
    customer_id: customerId,
    valid_until: data.valid_until ?? existing.valid_until,
    payment_terms: data.payment_terms?.trim() ?? existing.payment_terms,
    lines,
    ...totals,
    updated_at: new Date().toISOString(),
  };
  saveQuotations(quotations.map((quotation) => (quotation.id === id ? updated : quotation)));
  return updated;
}

export function markQuotationConverted(
  id: number,
  subscriptionId: number,
): Quotation {
  const quotations = readQuotations();
  const existing = quotations.find((quotation) => quotation.id === id);
  if (!existing) throw new Error("This quotation could not be found.");
  if (existing.status !== "accepted") {
    throw new Error("Only accepted quotations can be converted.");
  }
  if (existing.converted_subscription_id !== null) {
    throw new Error("This quotation has already been converted.");
  }
  const converted = {
    ...existing,
    status: "converted" as const,
    converted_subscription_id: subscriptionId,
    updated_at: new Date().toISOString(),
  };
  saveQuotations(quotations.map((quotation) => (quotation.id === id ? converted : quotation)));
  return converted;
}
