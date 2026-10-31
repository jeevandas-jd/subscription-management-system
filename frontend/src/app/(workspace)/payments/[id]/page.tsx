import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentDetails } from "@/components/finance/finance-pages";

export const metadata: Metadata = { title: "Payment details" };
export const instant = false;

export default async function PaymentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paymentId = Number(id);
  if (!Number.isSafeInteger(paymentId) || paymentId <= 0) notFound();
  return <PaymentDetails id={paymentId} />;
}
