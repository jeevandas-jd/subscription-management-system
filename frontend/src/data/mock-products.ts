import type { Product, ProductVariant } from "@/types/catalog";

export const productStorageKey = "subflow.products.v1";
export const variantStorageKey = "subflow.product-variants.v1";

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Software Subscription",
    type: "service",
    sales_price: "1000.00",
    cost_price: "400.00",
    notes: "Standard software product",
    is_active: true,
    created_at: "2026-10-10T09:30:00Z",
  },
  {
    id: 2,
    name: "Analytics Workspace",
    type: "digital",
    sales_price: "2450.00",
    cost_price: "820.00",
    notes: "Hosted analytics workspace for growing teams.",
    is_active: true,
    created_at: "2026-10-18T14:15:00Z",
  },
  {
    id: 3,
    name: "Onboarding Kit",
    type: "physical",
    sales_price: "750.00",
    cost_price: "315.00",
    notes: "Printed onboarding materials and welcome pack.",
    is_active: false,
    created_at: "2026-10-24T11:00:00Z",
  },
];

export const mockProductVariants: ProductVariant[] = [
  {
    id: 1,
    product_id: 1,
    name: "Odoo",
    additional_price: "560.00",
    is_active: true,
    created_at: "2026-10-12T08:00:00Z",
  },
  {
    id: 2,
    product_id: 1,
    name: "Enterprise",
    additional_price: "1200.00",
    is_active: true,
    created_at: "2026-10-13T08:00:00Z",
  },
  {
    id: 3,
    product_id: 2,
    name: "Advanced reporting",
    additional_price: "650.00",
    is_active: true,
    created_at: "2026-10-20T08:00:00Z",
  },
];
