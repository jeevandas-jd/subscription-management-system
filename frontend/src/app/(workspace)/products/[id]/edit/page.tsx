import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductEditScreen } from "@/components/catalog/product-pages";

export const metadata: Metadata = { title: "Edit product" };
export const instant = false;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId <= 0) notFound();
  return <ProductEditScreen id={productId} />;
}
