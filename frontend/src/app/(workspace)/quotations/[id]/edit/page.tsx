import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuotationEditScreen } from "@/components/lifecycle/quotation-pages";

export const metadata: Metadata = { title: "Edit quotation" };
export const instant = false;

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isSafeInteger(quotationId) || quotationId <= 0) notFound();
  return <QuotationEditScreen id={quotationId} />;
}
