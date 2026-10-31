import type { Metadata } from "next";
import { QuotationListing } from "@/components/lifecycle/quotation-pages";

export const metadata: Metadata = { title: "Quotations" };
export const instant = false;

export default function QuotationsPage() {
  return <QuotationListing />;
}
