import { Suspense } from "react";
import type { ReactNode } from "react";
import { AuthLoading } from "@/components/auth/auth-layout";
import { WorkspaceAccess } from "@/components/auth/workspace-access";
import { AuthProvider } from "@/lib/auth/auth-context";

export const instant = false;

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthProvider>
        <WorkspaceAccess>{children}</WorkspaceAccess>
      </AuthProvider>
    </Suspense>
  );
}
