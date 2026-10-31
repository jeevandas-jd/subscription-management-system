import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanDetails } from "@/components/catalog/plan-pages";

export const metadata: Metadata = { title: "Plan details" };
export const instant = false;

export default async function PlanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planId = Number(id);
  if (!Number.isSafeInteger(planId) || planId <= 0) notFound();
  return <PlanDetails id={planId} />;
}
