export type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted";

export type QuotationLine = {
  id: string;
  product_id: number;
  variant_id: number | null;
  plan_id: number;
  quantity: number;
  unit_price: string;
  line_total: string;
};

export type Quotation = {
  id: number;
  quotation_number: string;
  customer_id: string;
  status: QuotationStatus;
  valid_until: string;
  payment_terms: string;
  lines: QuotationLine[];
  subtotal: string;
  discount_total: string;
  tax_total: string;
  grand_total: string;
  created_at: string;
  updated_at: string;
  converted_subscription_id: number | null;
};

export type QuotationLineInput = Omit<QuotationLine, "id" | "line_total">;

export type QuotationCreatePayload = {
  customer_id: string;
  valid_until: string;
  lines: QuotationLineInput[];
  payment_terms: string;
};

export type QuotationUpdatePayload = Partial<QuotationCreatePayload>;
