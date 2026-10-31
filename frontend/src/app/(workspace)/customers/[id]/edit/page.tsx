import { Suspense } from "react";
import type { Metadata } from "next";
import CustomerEdit from "@/components/customers/customer-edit";
import { LoadingSkeleton, PageContainer } from "@/components/shared/ui";

export const metadata: Metadata = {
  title: "Edit customer",
};

export const instant = false;

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton className="h-8 w-64" />
          <div className="mx-auto w-full max-w-[920px] space-y-5">
            <LoadingSkeleton className="h-72" />
            <LoadingSkeleton className="h-64" />
          </div>
        </PageContainer>
      }
    >
      <EditCustomerWithParams params={params} />
    </Suspense>
  );
}

async function EditCustomerWithParams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerEdit customerId={id} />;
}
