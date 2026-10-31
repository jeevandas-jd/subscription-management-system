import type { Metadata } from "next";
import { PaymentListing } from "@/components/finance/finance-pages";

export const metadata: Metadata = { title: "Payments" };
export const instant = false;

export default function PaymentsPage() {
  return <PaymentListing />;
}
