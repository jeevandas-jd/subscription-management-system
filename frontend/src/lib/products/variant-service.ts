import { z } from "zod";
import { mockProductVariants, variantStorageKey } from "@/data/mock-products";
import type { ProductVariant, VariantCreatePayload } from "@/types/catalog";
import { getProductById } from "@/lib/products/product-service";

const variantSchema = z.object({
  id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  name: z.string().min(1),
  additional_price: z.string(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
});

function readVariants(): ProductVariant[] {
  const stored = window.localStorage.getItem(variantStorageKey);
  if (stored === null) return mockProductVariants.map((variant) => ({ ...variant }));

  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    throw new Error("Saved variant data is unreadable. Clear this browser's Subflow variant data to restore the samples.", { cause: error });
  }

  const parsed = z.array(variantSchema).safeParse(value);
  if (!parsed.success) {
    throw new Error("Saved variant data is invalid. Clear this browser's Subflow variant data to restore the samples.");
  }
  return parsed.data;
}

function saveVariants(variants: ProductVariant[]) {
  window.localStorage.setItem(variantStorageKey, JSON.stringify(variants));
}

export function getVariants(productId: number): ProductVariant[] {
  return readVariants().filter((variant) => variant.product_id === productId);
}

export function getAllVariants(): ProductVariant[] {
  return readVariants();
}

export function createVariant(
  productId: number,
  data: VariantCreatePayload,
): ProductVariant {
  if (!getProductById(productId)) throw new Error("This product could not be found.");
  const variants = readVariants();
  if (
    variants.some(
      (variant) =>
        variant.product_id === productId &&
        variant.name.toLocaleLowerCase() === data.name.trim().toLocaleLowerCase(),
    )
  ) {
    throw new Error("A variant with this name already exists for the product.");
  }

  const variant: ProductVariant = {
    ...data,
    id: Math.max(0, ...variants.map((record) => record.id)) + 1,
    product_id: productId,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  saveVariants([variant, ...variants]);
  return variant;
}

export function deleteVariantsForProduct(productId: number): void {
  const variants = readVariants();
  saveVariants(variants.filter((variant) => variant.product_id !== productId));
}
