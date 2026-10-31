import type { Metadata } from "next";
import { DiscountForm } from "@/components/discounts/discount-pages";

export const metadata: Metadata = { title: "New discount" };
export const instant = false;

export default function NewDiscountPage() {
  return <DiscountForm mode="create" />;
}
