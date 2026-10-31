import { LoadingSkeleton, PageContainer } from "@/components/shared/ui";

export default function DashboardLoading() {
  return (
    <PageContainer>
      <div className="space-y-3">
        <LoadingSkeleton className="h-3 w-20" />
        <LoadingSkeleton className="h-8 w-64 max-w-full" />
        <LoadingSkeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <LoadingSkeleton className="h-36" key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[1.7fr_0.9fr]">
        <LoadingSkeleton className="h-96" />
        <LoadingSkeleton className="h-96" />
      </div>
    </PageContainer>
  );
}
