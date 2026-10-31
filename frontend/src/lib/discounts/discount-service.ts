import { z } from "zod";
import { discountStorageKey, mockDiscounts } from "@/data/mock-discounts";
import type {
  Discount,
  DiscountCreatePayload,
  DiscountUpdatePayload,
} from "@/types/discount";

const moneySchema = z.string().regex(/^\d{1,10}\.\d{2}$/);

const discountSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().min(2).max(40),
  name: z.string().min(1).max(255),
  discount_type: z.enum(["fixed", "percentage"]),
  value: moneySchema,
  minimum_purchase: moneySchema,
  minimum_quantity: z.number().int().positive(),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }).nullable(),
  usage_limit: z.number().int().positive().nullable(),
  usage_count: z.number().int().nonnegative(),
  scope: z.enum(["product", "subscription"]),
  product_ids: z.array(z.number().int().positive()),
  is_active: z.boolean(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }).optional(),
});

function readDiscounts(): Discount[] {
  const stored = window.localStorage.getItem(discountStorageKey);
  if (stored === null) return mockDiscounts.map((discount) => ({ ...discount }));

  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    throw new Error(
      "Saved discount data is unreadable. Clear this browser's Subflow discount data to restore the samples.",
      { cause: error },
    );
  }

  const parsed = z.array(discountSchema).safeParse(value);
  if (!parsed.success) {
    throw new Error(
      "Saved discount data is invalid. Clear this browser's Subflow discount data to restore the samples.",
    );
  }
  return parsed.data;
}

function saveDiscounts(discounts: Discount[]) {
  window.localStorage.setItem(discountStorageKey, JSON.stringify(discounts));
}

function normalizedCode(code: string) {
  return code.trim().toLocaleUpperCase();
}

function assertUniqueCode(
  discounts: Discount[],
  code: string,
  excludedId?: number,
) {
  if (
    discounts.some(
      (discount) =>
        discount.id !== excludedId &&
        normalizedCode(discount.code) === normalizedCode(code),
    )
  ) {
    throw new Error("That discount code is already in use.");
  }
}

export function getDiscounts(): Discount[] {
  return readDiscounts().sort(
    (left, right) => right.created_at.localeCompare(left.created_at),
  );
}

export function getDiscountById(id: number): Discount | undefined {
  return readDiscounts().find((discount) => discount.id === id);
}

export function createDiscount(data: DiscountCreatePayload): Discount {
  const discounts = readDiscounts();
  assertUniqueCode(discounts, data.code);
  const now = new Date().toISOString();
  const discount: Discount = {
    ...data,
    code: normalizedCode(data.code),
    id: Math.max(0, ...discounts.map((record) => record.id)) + 1,
    usage_count: 0,
    created_at: now,
  };
  saveDiscounts([discount, ...discounts]);
  return discount;
}

export function updateDiscount(
  id: number,
  data: DiscountUpdatePayload,
): Discount {
  const discounts = readDiscounts();
  const existing = discounts.find((discount) => discount.id === id);
  if (!existing) throw new Error("This discount could not be found.");
  if (data.code) assertUniqueCode(discounts, data.code, id);

  const updated: Discount = {
    ...existing,
    ...data,
    ...(data.code ? { code: normalizedCode(data.code) } : {}),
    updated_at: new Date().toISOString(),
  };
  saveDiscounts(
    discounts.map((discount) => (discount.id === id ? updated : discount)),
  );
  return updated;
}

export function deleteDiscount(id: number): void {
  const discounts = readDiscounts();
  if (!discounts.some((discount) => discount.id === id)) {
    throw new Error("This discount could not be found.");
  }
  saveDiscounts(discounts.filter((discount) => discount.id !== id));
}
