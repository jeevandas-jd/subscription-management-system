export type ProductType = "service" | "physical" | "digital";

export type BillingInterval = "daily" | "weekly" | "monthly" | "yearly";

export type Product = {
  id: number;
  name: string;
  type: ProductType;
  sales_price: string;
  cost_price: string;
  notes: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductCreatePayload = {
  name: string;
  type: ProductType;
  sales_price: string;
  cost_price: string;
  notes: string;
};

export type ProductUpdatePayload = Partial<ProductCreatePayload>;

export type ProductVariant = {
  id: number;
  product_id: number;
  name: string;
  additional_price: string;
  is_active?: boolean;
  created_at?: string;
};

export type VariantCreatePayload = {
  name: string;
  additional_price: string;
};

export type SubscriptionPlan = {
  id: number;
  name: string;
  billing_interval: BillingInterval;
  billing_interval_count: number;
  minimum_quantity: number;
  available_from: string;
  available_until: string | null;
  auto_close: boolean;
  allow_early_close: boolean;
  allow_pause: boolean;
  allow_renewal: boolean;
  is_active?: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type PlanCreatePayload = Omit<SubscriptionPlan, "id" | "is_active" | "description" | "created_at" | "updated_at">;

export type PlanUpdatePayload = Partial<PlanCreatePayload>;
