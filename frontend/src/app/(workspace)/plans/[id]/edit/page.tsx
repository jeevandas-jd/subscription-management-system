import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanEditScreen } from "@/components/catalog/plan-pages";

export const metadata: Metadata = { title: "Edit plan" };
export const instant = false;

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const planId = Number(id);
  if (!Number.isSafeInteger(planId) || planId <= 0) notFound();
  return <PlanEditScreen id={planId} />;
}
