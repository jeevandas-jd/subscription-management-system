export type InvoiceStatus = "draft" | "confirmed" | "paid" | "cancelled";

export type InvoiceLine = {
  id: string;
  product_id: number | null;
  description: string;
  quantity: number;
  unit_price: string;
  discount_amount: string;
  tax_rate: string;
  tax_amount: string;
  line_total: string;
};

export type Invoice = {
  id: number;
  invoice_number: string;
  customer_id: string;
  subscription_id: number | null;
  status: InvoiceStatus;
  billing_period_start: string | null;
  billing_period_end: string | null;
  issue_date: string;
  due_date: string;
  subtotal: string;
  discount_total: string;
  tax_total: string;
  grand_total: string;
  amount_paid: string;
  notes: string;
  cancel_reason: string | null;
  lines: InvoiceLine[];
  created_at: string;
  updated_at: string;
};

export type InvoiceCreatePayload = {
  subscription_id: number;
  billing_period_start: string;
  billing_period_end: string;
  notes: string;
};

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "upi"
  | "card"
  | "online"
  | "other";

export type PaymentStatus = "recorded" | "pending" | "failed" | "reversed";

export type Payment = {
  id: number;
  payment_reference: string;
  customer_id: string;
  invoice_id: number;
  amount: string;
  payment_method: PaymentMethod;
  payment_date: string;
  status: PaymentStatus;
  notes: string;
  created_at: string;
};

export type PaymentCreatePayload = {
  invoice_id: number;
  amount: string;
  payment_method: PaymentMethod;
  payment_date: string;
  reference: string;
  notes: string;
};
