export type DiscountType = "fixed" | "percentage";
export type DiscountScope = "product" | "subscription";

export type Discount = {
  id: number;
  code: string;
  name: string;
  discount_type: DiscountType;
  value: string;
  minimum_purchase: string;
  minimum_quantity: number;
  starts_at: string;
  ends_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  scope: DiscountScope;
  product_ids: number[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

export type DiscountCreatePayload = Omit<
  Discount,
  "id" | "usage_count" | "created_at" | "updated_at"
>;

export type DiscountUpdatePayload = Partial<DiscountCreatePayload>;
