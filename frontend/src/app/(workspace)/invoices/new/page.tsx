import type { Metadata } from "next";
import { InvoiceCreateForm } from "@/components/finance/finance-pages";

export const metadata: Metadata = { title: "Create invoice" };
export const instant = false;

export default function NewInvoicePage() {
  return <InvoiceCreateForm />;
}
