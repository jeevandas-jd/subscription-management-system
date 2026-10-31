import type { Metadata } from "next";
import { CustomerPortalOverview } from "@/components/auth/customer-portal-overview";

export const metadata: Metadata = { title: "Customer portal" };

export const instant = false;

export default function CustomerPortalPage() {
  return <CustomerPortalOverview />;
}
