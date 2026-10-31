import type { Metadata } from "next";
import { QuotationForm } from "@/components/lifecycle/quotation-pages";

export const metadata: Metadata = { title: "New quotation" };
export const instant = false;

export default function NewQuotationPage() {
  return <QuotationForm mode="create" />;
}
