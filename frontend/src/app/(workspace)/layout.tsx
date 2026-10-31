import { Suspense } from "react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <main className="px-4 py-6 sm:px-6 xl:px-9">{children}</main>
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
