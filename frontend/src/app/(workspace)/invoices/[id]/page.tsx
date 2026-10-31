import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceDetails } from "@/components/finance/finance-pages";

export const metadata: Metadata = { title: "Invoice details" };
export const instant = false;

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoiceId = Number(id);
  if (!Number.isSafeInteger(invoiceId) || invoiceId <= 0) notFound();
  return <InvoiceDetails id={invoiceId} />;
}
