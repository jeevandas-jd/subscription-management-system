import type { Metadata } from "next";
import { ProductForm } from "@/components/catalog/product-pages";

export const metadata: Metadata = { title: "Add product" };
export const instant = false;

export default function NewProductPage() {
  return <ProductForm mode="create" />;
}
