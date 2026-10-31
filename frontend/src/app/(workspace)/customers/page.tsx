import type { Metadata } from "next";
import CustomerListing from "@/components/customers/customer-listing";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return <CustomerListing />;
}
