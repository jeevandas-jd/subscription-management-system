export type SubscriptionStatus =
  | "draft"
  | "quotation"
  | "confirmed"
  | "active"
  | "paused"
  | "closed";

export type Subscription = {
  id: number;
  subscription_number: string;
  customer_id: string;
  plan_id: number;
  quotation_id: number | null;
  status: SubscriptionStatus;
  start_date: string;
  expiry_date: string | null;
  next_billing_date: string | null;
  payment_terms: string;
  lines: SubscriptionLine[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

export type SubscriptionLine = {
  id: string;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: string;
  line_total: string;
};

export type SubscriptionLineInput = Omit<SubscriptionLine, "id" | "line_total">;

export type SubscriptionCreatePayload = {
  customer_id: string;
  plan_id: number;
  start_date: string;
  expiry_date: string | null;
  payment_terms: string;
  lines: SubscriptionLineInput[];
  quotation_id?: number | null;
};

export type SubscriptionUpdatePayload = Partial<
  Pick<Subscription, "start_date" | "expiry_date" | "payment_terms">
> & {
  lines?: SubscriptionLineInput[];
};

export type SubscriptionAction =
  | "confirm"
  | "pause"
  | "resume"
  | "renew"
  | "close";
