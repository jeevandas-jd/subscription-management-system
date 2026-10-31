import { z } from "zod";
import { invoiceStorageKey, mockInvoices } from "@/data/mock-invoices";
import { getCustomerById } from "@/lib/customers/customer-service";
import { getProductById } from "@/lib/products/product-service";
import { getSubscriptionById } from "@/lib/subscriptions/subscription-service";
import type { Invoice, InvoiceCreatePayload, InvoiceLine } from "@/types/finance";

const lineSchema = z.object({
  id: z.string().min(1),
  product_id: z.number().int().positive().nullable(),
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_price: z.string().regex(/^\d+\.\d{2}$/),
  discount_amount: z.string().regex(/^\d+\.\d{2}$/),
  tax_rate: z.string().regex(/^\d+\.\d{4}$/),
  tax_amount: z.string().regex(/^\d+\.\d{2}$/),
  line_total: z.string().regex(/^\d+\.\d{2}$/),
});

const invoiceSchema = z.object({
  id: z.number().int().positive(),
  invoice_number: z.string().min(1),
  customer_id: z.string().min(1),
  subscription_id: z.number().int().positive().nullable(),
  status: z.enum(["draft", "confirmed", "paid", "cancelled"]),
  billing_period_start: z.string().nullable(),
  billing_period_end: z.string().nullable(),
  issue_date: z.string(),
  due_date: z.string(),
  subtotal: z.string().regex(/^\d+\.\d{2}$/),
  discount_total: z.string().regex(/^\d+\.\d{2}$/),
  tax_total: z.string().regex(/^\d+\.\d{2}$/),
  grand_total: z.string().regex(/^\d+\.\d{2}$/),
  amount_paid: z.string().regex(/^\d+\.\d{2}$/),
  notes: z.string(),
  cancel_reason: z.string().nullable(),
  lines: z.array(lineSchema).min(1),
  created_at: z.string(),
  updated_at: z.string(),
});

function readInvoices(): Invoice[] {
  const stored = window.localStorage.getItem(invoiceStorageKey);
  if (stored === null) return mockInvoices.map((invoice) => ({ ...invoice, lines: invoice.lines.map((line) => ({ ...line })) }));
  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    throw new Error("Saved invoice data is unreadable. Clear this browser's Subflow invoice data to restore the samples.", { cause: error });
  }
  const parsed = z.array(invoiceSchema).safeParse(value);
  if (!parsed.success) throw new Error("Saved invoice data is invalid. Clear this browser's Subflow invoice data to restore the samples.");
  return parsed.data;
}

function saveInvoices(invoices: Invoice[]) {
  window.localStorage.setItem(invoiceStorageKey, JSON.stringify(invoices));
}

function validDate(value: string, label: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) ||
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) !== value) {
    throw new Error(`Choose a valid ${label}.`);
  }
}

function dueDateFromTerms(issueDate: string, paymentTerms: string) {
  const days = paymentTerms.match(/\bnet\s+(\d+)\b/i);
  const due = new Date(`${issueDate}T12:00:00.000Z`);
  due.setUTCDate(due.getUTCDate() + (days ? Number(days[1]) : 30));
  return due.toISOString().slice(0, 10);
}

function cents(value: string) {
  if (!/^\d+\.\d{2}$/.test(value)) throw new Error("Invoice amounts must have two decimal places.");
  return Math.round(Number(value) * 100);
}

export function calculateInvoiceTotals(lines: Pick<InvoiceLine, "quantity" | "unit_price" | "discount_amount" | "tax_amount">[]) {
  const subtotalCents = lines.reduce((sum, line) => sum + cents(line.unit_price) * line.quantity, 0);
  const discountCents = lines.reduce((sum, line) => sum + cents(line.discount_amount), 0);
  const taxCents = lines.reduce((sum, line) => sum + cents(line.tax_amount), 0);
  const grandTotalCents = subtotalCents - discountCents + taxCents;
  if (grandTotalCents < 0) throw new Error("Invoice total cannot be negative.");
  return {
    subtotal: (subtotalCents / 100).toFixed(2),
    discount_total: (discountCents / 100).toFixed(2),
    tax_total: (taxCents / 100).toFixed(2),
    grand_total: (grandTotalCents / 100).toFixed(2),
  };
}

export function getInvoices() {
  return readInvoices().sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export function getInvoiceById(id: number) {
  return readInvoices().find((invoice) => invoice.id === id);
}

export function getInvoiceBalance(invoice: Invoice) {
  return Math.max(0, cents(invoice.grand_total) - cents(invoice.amount_paid));
}

export function createInvoice(data: InvoiceCreatePayload) {
  validDate(data.billing_period_start, "billing period start");
  validDate(data.billing_period_end, "billing period end");
  if (data.billing_period_end <= data.billing_period_start) throw new Error("Billing period end must be after its start.");
  const subscription = getSubscriptionById(data.subscription_id);
  if (!subscription) throw new Error("The selected subscription could not be found.");
  if (!["confirmed", "active"].includes(subscription.status)) throw new Error("Only confirmed or active subscriptions can be billed in this demo.");
  if (!getCustomerById(subscription.customer_id)) throw new Error("The subscription customer could not be found.");

  const invoices = readInvoices();
  const duplicate = invoices.some((invoice) =>
    invoice.subscription_id === subscription.id &&
    invoice.billing_period_start === data.billing_period_start &&
    invoice.billing_period_end === data.billing_period_end,
  );
  if (duplicate) throw new Error("An invoice already exists for this subscription and billing period.");

  const lines: InvoiceLine[] = subscription.lines.map((line, index) => {
    const product = getProductById(line.product_id);
    if (!product) throw new Error("A product on this subscription could not be found.");
    const variantName = line.variant_id === null ? "" : ` · Variant ${line.variant_id}`;
    const lineAmount = Math.round(Number(line.unit_price) * 100) * line.quantity;
    return {
      id: `invoice-${Date.now()}-${index}`,
      product_id: line.product_id,
      description: `${product.name}${variantName}`,
      quantity: line.quantity,
      unit_price: line.unit_price,
      discount_amount: "0.00",
      tax_rate: "0.0000",
      tax_amount: "0.00",
      line_total: (lineAmount / 100).toFixed(2),
    };
  });
  const totals = calculateInvoiceTotals(lines);
  const id = Math.max(0, ...invoices.map((invoice) => invoice.id)) + 1;
  const now = new Date().toISOString();
  const issueDate = now.slice(0, 10);
  const invoice: Invoice = {
    id,
    invoice_number: `INV-${new Date().getFullYear()}-${String(id).padStart(5, "0")}`,
    customer_id: subscription.customer_id,
    subscription_id: subscription.id,
    status: "draft",
    billing_period_start: data.billing_period_start,
    billing_period_end: data.billing_period_end,
    issue_date: issueDate,
    due_date: dueDateFromTerms(issueDate, subscription.payment_terms),
    ...totals,
    amount_paid: "0.00",
    notes: data.notes.trim(),
    cancel_reason: null,
    lines,
    created_at: now,
    updated_at: now,
  };
  saveInvoices([invoice, ...invoices]);
  return invoice;
}

export function confirmInvoice(id: number) {
  const invoices = readInvoices();
  const invoice = invoices.find((item) => item.id === id);
  if (!invoice) throw new Error("This invoice could not be found.");
  if (invoice.status !== "draft") throw new Error("Only draft invoices can be confirmed.");
  const updated = { ...invoice, status: "confirmed" as const, updated_at: new Date().toISOString() };
  saveInvoices(invoices.map((item) => item.id === id ? updated : item));
  return updated;
}

export function cancelInvoice(id: number, reason: string) {
  const invoices = readInvoices();
  const invoice = invoices.find((item) => item.id === id);
  if (!invoice) throw new Error("This invoice could not be found.");
  if (invoice.status === "paid" || invoice.status === "cancelled" || cents(invoice.amount_paid) > 0) {
    throw new Error("Paid, partially paid, or already cancelled invoices cannot be cancelled.");
  }
  if (!reason.trim()) throw new Error("Enter a reason for cancelling this invoice.");
  const updated = {
    ...invoice,
    status: "cancelled" as const,
    cancel_reason: reason.trim(),
    updated_at: new Date().toISOString(),
  };
  saveInvoices(invoices.map((item) => item.id === id ? updated : item));
  return updated;
}

export function updateInvoiceForPayment(id: number, amountPaid: string) {
  const invoices = readInvoices();
  const invoice = invoices.find((item) => item.id === id);
  if (!invoice) throw new Error("The invoice for this payment could not be found.");
  const paidCents = cents(amountPaid);
  if (paidCents > cents(invoice.grand_total)) throw new Error("Payments cannot exceed the invoice total.");
  const updated = {
    ...invoice,
    amount_paid: amountPaid,
    status: paidCents === cents(invoice.grand_total) ? "paid" as const : invoice.status,
    updated_at: new Date().toISOString(),
  };
  saveInvoices(invoices.map((item) => item.id === id ? updated : item));
  return updated;
}
