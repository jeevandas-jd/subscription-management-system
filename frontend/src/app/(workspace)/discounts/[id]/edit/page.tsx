import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscountForm } from "@/components/discounts/discount-pages";

export const metadata: Metadata = { title: "Edit discount" };
export const instant = false;

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const discountId = Number(id);
  if (!Number.isSafeInteger(discountId) || discountId <= 0) notFound();
  return <DiscountForm mode="edit" id={discountId} />;
}
