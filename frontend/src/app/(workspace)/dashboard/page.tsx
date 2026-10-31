import type { Metadata } from "next";
import DashboardOverview from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const instant = false;

export default function DashboardPage() {
  return <DashboardOverview />;
}
