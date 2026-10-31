import type { Metadata } from "next";
import { BillingOverview } from "@/components/finance/billing-overview";

export const metadata: Metadata = { title: "Billing overview" };
export const instant = false;

export default function BillingPage() {
  return <BillingOverview />;
}

