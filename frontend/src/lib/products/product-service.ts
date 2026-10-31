import { z } from "zod";
import { mockProducts, productStorageKey } from "@/data/mock-products";
import type {
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
} from "@/types/catalog";

const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  type: z.enum(["service", "physical", "digital"]),
  sales_price: z.string(),
  cost_price: z.string(),
  notes: z.string(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

function readProducts(): Product[] {
  const stored = window.localStorage.getItem(productStorageKey);
  if (stored === null) return mockProducts.map((product) => ({ ...product }));

  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    throw new Error("Saved product data is unreadable. Clear this browser's Subflow product data to restore the samples.", { cause: error });
  }

  const parsed = z.array(productSchema).safeParse(value);
  if (!parsed.success) {
    throw new Error("Saved product data is invalid. Clear this browser's Subflow product data to restore the samples.");
  }
  return parsed.data;
}

function saveProducts(products: Product[]) {
  window.localStorage.setItem(productStorageKey, JSON.stringify(products));
}

export function getProducts(): Product[] {
  return readProducts().sort(
    (left, right) => (right.created_at ?? "").localeCompare(left.created_at ?? ""),
  );
}

export function getProductById(id: number): Product | undefined {
  return readProducts().find((product) => product.id === id);
}

export function createProduct(data: ProductCreatePayload): Product {
  const products = readProducts();
  const now = new Date().toISOString();
  const product: Product = {
    ...data,
    id: Math.max(0, ...products.map((record) => record.id)) + 1,
    is_active: true,
    created_at: now,
  };
  saveProducts([product, ...products]);
  return product;
}

export function updateProduct(id: number, data: ProductUpdatePayload): Product {
  const products = readProducts();
  const existing = products.find((product) => product.id === id);
  if (!existing) throw new Error("This product could not be found.");

  const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
  saveProducts(products.map((product) => (product.id === id ? updated : product)));
  return updated;
}

export function deleteProduct(id: number): void {
  const products = readProducts();
  if (!products.some((product) => product.id === id)) {
    throw new Error("This product could not be found.");
  }
  saveProducts(products.filter((product) => product.id !== id));
}
