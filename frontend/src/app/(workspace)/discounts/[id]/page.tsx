import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscountDetails } from "@/components/discounts/discount-pages";

export const metadata: Metadata = { title: "Discount details" };
export const instant = false;

export default async function DiscountDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const discountId = Number(id);
  if (!Number.isSafeInteger(discountId) || discountId <= 0) notFound();
  return <DiscountDetails id={discountId} />;
}
