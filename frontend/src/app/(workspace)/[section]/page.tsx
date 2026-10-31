import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState, PageContainer, PageHeader } from "@/components/shared/ui";
import { workspacePages } from "@/data/navigation";

export function generateStaticParams() {
  return workspacePages
    .filter((page) => page.slug !== "dashboard")
    .map((page) => ({ section: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const page = workspacePages.find((item) => item.slug === section);

  return page ? { title: page.label } : {};
}

export default async function WorkspaceSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const page = workspacePages.find((item) => item.slug === section);

  if (!page || page.slug === "dashboard") {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title={page.label}
        description={page.description}
      />
      <EmptyState
        icon={page.icon}
        title={`${page.label} is coming soon`}
        description="This module is part of the Subflow roadmap and will be introduced in a later sprint. Your dashboard and navigation are ready to use in the meantime."
      />
    </PageContainer>
  );
}
