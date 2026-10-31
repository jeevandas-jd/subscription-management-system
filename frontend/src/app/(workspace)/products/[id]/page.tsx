import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/catalog/product-pages";

export const metadata: Metadata = { title: "Product details" };
export const instant = false;

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId <= 0) notFound();
  return <ProductDetails id={productId} />;
}
