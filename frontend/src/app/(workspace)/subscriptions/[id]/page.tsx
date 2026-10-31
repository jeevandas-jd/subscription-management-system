import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubscriptionDetails } from "@/components/lifecycle/subscription-pages";

export const metadata: Metadata = { title: "Subscription details" };
export const instant = false;

export default async function SubscriptionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subscriptionId = Number(id);
  if (!Number.isSafeInteger(subscriptionId) || subscriptionId <= 0) notFound();
  return <SubscriptionDetails id={subscriptionId} />;
}
