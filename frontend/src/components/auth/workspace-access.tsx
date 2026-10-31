"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthLoading } from "@/components/auth/auth-layout";
import { useAuth } from "@/lib/auth/auth-context";
import { canAccessPath, landingPageForRole } from "@/lib/auth/permissions";

export function WorkspaceAccess({ children }: { children: ReactNode }) {
  const { user, status, error, refreshSession } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status === "loading" || status === "unauthenticated") {
    return <AuthLoading />;
  }

  if (status === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <ShieldAlert size={20} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Session could not be verified</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ?? "The authentication service is unavailable."}
          </p>
          <button
            type="button"
            onClick={() => void refreshSession()}
            className="mt-5 h-10 rounded-lg bg-[#635bff] px-4 text-sm font-semibold text-white transition hover:bg-[#5148e5]"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (!user) return <AuthLoading />;

  if (!canAccessPath(user.role, pathname)) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert size={20} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Access not available</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your account role does not have access to this workspace section.
          </p>
          <Link
            href={landingPageForRole(user.role)}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-sm font-semibold text-white transition hover:bg-[#5148e5]"
          >
            Go to your workspace
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>
      </main>
    );
  }

  return <AppShell>{children}</AppShell>;
}
