import type { Metadata } from "next";
import AnalyticsOverview from "@/components/analytics/analytics-overview";

export const metadata: Metadata = {
  title: "Analytics",
};

export const instant = false;

export default function AnalyticsPage() {
  return <AnalyticsOverview />;
}
