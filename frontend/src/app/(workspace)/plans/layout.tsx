import type { ReactNode } from "react";
import { PlanProvider } from "@/components/catalog/catalog-provider";

export default function PlansLayout({ children }: { children: ReactNode }) {
  return <PlanProvider>{children}</PlanProvider>;
}
