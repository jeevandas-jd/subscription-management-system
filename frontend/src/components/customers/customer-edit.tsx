"use client";

import Link from "next/link";
import { ArrowLeft, CircleHelp } from "lucide-react";
import CustomerForm from "@/components/customers/customer-form";
import {
  CustomerStorageNotice,
  useCustomers,
} from "@/components/customers/customer-provider";
import { LoadingSkeleton, PageContainer } from "@/components/shared/ui";

export default function CustomerEdit({ customerId }: { customerId: string }) {
  const { customers, isReady, storageError } = useCustomers();
  const customer = customers.find((item) => item.id === customerId);

  if (!isReady) {
    return (
      <PageContainer>
        <LoadingSkeleton className="h-8 w-64" />
        <div className="mx-auto w-full max-w-[920px] space-y-5">
          <LoadingSkeleton className="h-72" />
          <LoadingSkeleton className="h-64" />
        </div>
      </PageContainer>
    );
  }

  if (storageError) {
    return (
      <PageContainer>
        <CustomerStorageNotice />
      </PageContainer>
    );
  }

  if (!customer) {
    return (
      <PageContainer>
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 text-center">
          <CircleHelp className="text-slate-400" size={24} aria-hidden="true" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">Customer not found</h1>
          <p className="mt-1 text-sm text-slate-500">This customer may have been removed from the local sample directory.</p>
          <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#635bff]" href="/customers">
            <ArrowLeft size={15} aria-hidden="true" />
            Return to customers
          </Link>
        </div>
      </PageContainer>
    );
  }

  return <CustomerForm key={customer.id} mode="edit" customer={customer} />;
}
