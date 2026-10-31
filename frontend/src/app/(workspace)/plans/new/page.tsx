import type { Metadata } from "next";
import { PlanForm } from "@/components/catalog/plan-pages";

export const metadata: Metadata = { title: "Add plan" };
export const instant = false;

export default function NewPlanPage() {
  return <PlanForm mode="create" />;
}
