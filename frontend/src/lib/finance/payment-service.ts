import { z } from "zod";
import { paymentStorageKey, mockPayments } from "@/data/mock-payments";
import { getCustomerById } from "@/lib/customers/customer-service";
import { getInvoiceBalance, getInvoices, updateInvoiceForPayment } from "@/lib/finance/invoice-service";
import type { Payment, PaymentCreatePayload } from "@/types/finance";

const paymentSchema = z.object({
  id: z.number().int().positive(),
  payment_reference: z.string().min(1),
  customer_id: z.string().min(1),
  invoice_id: z.number().int().positive(),
  amount: z.string().regex(/^\d+\.\d{2}$/),
  payment_method: z.enum(["cash", "bank_transfer", "upi", "card", "online", "other"]),
  payment_date: z.string(),
  status: z.enum(["recorded", "pending", "failed", "reversed"]),
  notes: z.string(),
  created_at: z.string(),
});

function readPayments(): Payment[] {
  const stored = window.localStorage.getItem(paymentStorageKey);
  if (stored === null) return mockPayments.map((payment) => ({ ...payment }));
  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    throw new Error("Saved payment data is unreadable. Clear this browser's Subflow payment data to restore the samples.", { cause: error });
  }
  const parsed = z.array(paymentSchema).safeParse(value);
  if (!parsed.success) throw new Error("Saved payment data is invalid. Clear this browser's Subflow payment data to restore the samples.");
  return parsed.data;
}

function savePayments(payments: Payment[]) {
  window.localStorage.setItem(paymentStorageKey, JSON.stringify(payments));
}

function amountCents(amount: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error("Enter a valid payment amount with up to two decimals.");
  return Math.round(Number(amount) * 100);
}

export function getPayments() {
  return readPayments().sort((left, right) => right.payment_date.localeCompare(left.payment_date));
}

export function getPaymentById(id: number) {
  return readPayments().find((payment) => payment.id === id);
}

export function recordPayment(data: PaymentCreatePayload) {
  const invoice = getInvoices().find((item) => item.id === data.invoice_id);
  if (!invoice) throw new Error("The selected invoice could not be found.");
  if (invoice.status !== "confirmed") throw new Error("Payments can only be recorded against confirmed invoices with a balance.");
  const amount = amountCents(data.amount);
  if (amount <= 0) throw new Error("Payment amount must be greater than zero.");
  if (amount > getInvoiceBalance(invoice)) throw new Error("Payment amount exceeds the invoice's outstanding balance.");
  const reference = data.reference.trim();
  if (!reference) throw new Error("Enter a unique payment reference.");
  const payments = readPayments();
  if (payments.some((payment) => payment.payment_reference.toLocaleLowerCase() === reference.toLocaleLowerCase())) {
    throw new Error("A payment with this reference already exists.");
  }
  const paymentDate = new Date(data.payment_date);
  if (Number.isNaN(paymentDate.getTime())) throw new Error("Choose a valid payment date and time.");
  const customer = getCustomerById(invoice.customer_id);
  if (!customer) throw new Error("The invoice customer could not be found.");
  const amountString = (amount / 100).toFixed(2);
  const payment: Payment = {
    id: Math.max(0, ...payments.map((item) => item.id)) + 1,
    payment_reference: reference,
    customer_id: invoice.customer_id,
    invoice_id: invoice.id,
    amount: amountString,
    payment_method: data.payment_method,
    payment_date: paymentDate.toISOString(),
    status: "recorded",
    notes: data.notes.trim(),
    created_at: new Date().toISOString(),
  };
  savePayments([payment, ...payments]);
  try {
    const totalPaid = Math.round(Number(invoice.amount_paid) * 100) + amount;
    updateInvoiceForPayment(invoice.id, (totalPaid / 100).toFixed(2));
  } catch (error) {
    try {
      savePayments(payments);
    } catch {
      throw new Error("Payment storage could not be reconciled. Reload the page and check the local demo records.");
    }
    throw error;
  }
  return payment;
}
