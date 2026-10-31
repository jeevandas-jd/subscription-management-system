import type { Metadata } from "next";
import { InvoiceListing } from "@/components/finance/finance-pages";

export const metadata: Metadata = { title: "Invoices" };
export const instant = false;

export default function InvoicesPage() {
  return <InvoiceListing />;
}
