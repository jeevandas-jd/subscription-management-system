import type { Metadata } from "next";
import { PaymentCreateForm } from "@/components/finance/finance-pages";

export const metadata: Metadata = { title: "Record payment" };
export const instant = false;

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  const { invoice = "" } = await searchParams;
  return <PaymentCreateForm initialInvoiceId={invoice} />;
}
