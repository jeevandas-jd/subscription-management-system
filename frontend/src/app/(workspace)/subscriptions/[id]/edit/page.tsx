import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubscriptionEditScreen } from "@/components/lifecycle/subscription-pages";

export const metadata: Metadata = { title: "Edit subscription" };
export const instant = false;

export default async function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subscriptionId = Number(id);
  if (!Number.isSafeInteger(subscriptionId) || subscriptionId <= 0) notFound();
  return <SubscriptionEditScreen id={subscriptionId} />;
}
