import type { Metadata } from "next";
import { SubscriptionListing } from "@/components/lifecycle/subscription-pages";

export const metadata: Metadata = { title: "Subscriptions" };
export const instant = false;

export default function SubscriptionsPage() {
  return <SubscriptionListing />;
}
