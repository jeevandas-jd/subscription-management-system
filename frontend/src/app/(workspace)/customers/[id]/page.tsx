import { Suspense } from "react";
import type { Metadata } from "next";
import CustomerDetail from "@/components/customers/customer-detail";
import { LoadingSkeleton, PageContainer } from "@/components/shared/ui";

export const metadata: Metadata = {
  title: "Customer profile",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton className="h-8 w-64" />
          <LoadingSkeleton className="h-52" />
          <LoadingSkeleton className="h-56" />
        </PageContainer>
      }
    >
      <CustomerDetailWithParams params={params} />
    </Suspense>
  );
}

async function CustomerDetailWithParams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetail customerId={id} />;
}
