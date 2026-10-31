import type { Metadata } from "next";
import { ProductListing } from "@/components/catalog/product-pages";

export const metadata: Metadata = { title: "Products" };
export const instant = false;

export default function ProductsPage() {
  return <ProductListing />;
}
