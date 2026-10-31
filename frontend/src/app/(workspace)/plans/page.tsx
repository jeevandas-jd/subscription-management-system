import type { Metadata } from "next";
import { PlanListing } from "@/components/catalog/plan-pages";

export const metadata: Metadata = { title: "Subscription plans" };
export const instant = false;

export default function PlansPage() {
  return <PlanListing />;
}
