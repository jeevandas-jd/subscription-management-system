import type { Metadata } from "next";
import { SubscriptionForm } from "@/components/lifecycle/subscription-pages";

export const metadata: Metadata = { title: "New subscription" };
export const instant = false;

export default function NewSubscriptionPage() {
  return <SubscriptionForm mode="create" />;
}
