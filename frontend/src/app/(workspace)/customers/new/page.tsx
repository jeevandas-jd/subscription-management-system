import type { Metadata } from "next";
import CustomerForm from "@/components/customers/customer-form";

export const metadata: Metadata = {
  title: "Add customer",
};

export default function NewCustomerPage() {
  return <CustomerForm mode="create" />;
}
