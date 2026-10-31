import type { Metadata } from "next";
import { DiscountListing } from "@/components/discounts/discount-pages";

export const metadata: Metadata = { title: "Discounts" };
export const instant = false;

export default function DiscountsPage() {
  return <DiscountListing />;
}
