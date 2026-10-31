import { Suspense } from "react";
import type { ReactNode } from "react";
import { AuthLoading } from "@/components/auth/auth-layout";
import { WorkspaceAccess } from "@/components/auth/workspace-access";
import { LifecycleProvider } from "@/components/lifecycle/lifecycle-provider";
import { AuthProvider } from "@/lib/auth/auth-context";

export const instant = false;

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthProvider>
        <WorkspaceAccess>
          <LifecycleProvider>{children}</LifecycleProvider>
        </WorkspaceAccess>
      </AuthProvider>
    </Suspense>
  );
}
