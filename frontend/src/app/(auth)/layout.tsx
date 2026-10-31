import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/auth-context";
import { AuthLayout, AuthLoading } from "@/components/auth/auth-layout";

export const instant = false;

export default function PublicAuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthProvider>
        <AuthLayout>{children}</AuthLayout>
      </AuthProvider>
    </Suspense>
  );
}
