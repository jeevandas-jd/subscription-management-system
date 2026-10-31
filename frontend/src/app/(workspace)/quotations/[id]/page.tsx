import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuotationDetails } from "@/components/lifecycle/quotation-pages";

export const metadata: Metadata = { title: "Quotation details" };
export const instant = false;

export default async function QuotationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isSafeInteger(quotationId) || quotationId <= 0) notFound();
  return <QuotationDetails id={quotationId} />;
}
