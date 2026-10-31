"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { landingPageForRole } from "@/lib/auth/permissions";

export function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, user } = useAuth();
  const resolvedInitialSession = useRef(false);

  useEffect(() => {
    if (status === "loading" || resolvedInitialSession.current) return;
    resolvedInitialSession.current = true;
    if (status === "authenticated" && user) {
      router.replace(landingPageForRole(user.role));
    }
  }, [router, status, user]);

  if (status === "loading" || status === "authenticated") {
    return <AuthLoading />;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[minmax(380px,0.92fr)_minmax(500px,1.08fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#111827] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-36 -top-32 size-[520px] rounded-full border border-white/[0.06]" />
        <div className="absolute -right-16 -top-12 size-[340px] rounded-full border border-white/[0.07]" />
        <Link href="/login" className="relative flex w-fit items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#635bff] text-lg font-bold shadow-lg shadow-[#635bff]/25">
            S
          </span>
          <span className="text-lg font-semibold tracking-tight">Subflow</span>
        </Link>

        <div className="relative max-w-[470px] py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-300">
            <Sparkles size={13} className="text-[#aaa5ff]" aria-hidden="true" />
            A clearer view of recurring revenue
          </span>
          <h1 className="mt-7 text-4xl font-semibold leading-[1.15] tracking-tight xl:text-[46px]">
            Subscription operations, all in one place.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            Manage customer relationships, recurring billing, and the work that
            keeps your business moving.
          </p>
          <div className="mt-10 space-y-4">
            <FeatureLine text="Keep customer and billing workflows connected" />
            <FeatureLine text="Give every team member the right level of access" />
            <FeatureLine text="Stay focused on what needs attention today" />
          </div>
        </div>

        <p className="relative text-[11px] text-slate-500">
          © {new Date().getFullYear()} Subflow workspace
        </p>
      </aside>

      <section className="flex min-h-screen flex-col px-5 py-7 sm:px-8 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between lg:hidden">
          <Link href="/login" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-[#635bff] text-sm font-bold text-white">
              S
            </span>
            <span className="text-base font-semibold tracking-tight">Subflow</span>
          </Link>
          <span className="text-[11px] text-slate-400">Secure workspace</span>
        </div>
        <div className="flex flex-1 items-center justify-center py-9 lg:py-0">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
        <p className="text-center text-[11px] text-slate-400">
          Secure access for your Subflow workspace
        </p>
      </section>
    </main>
  );
}

export function AuthLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <span className="size-4 animate-spin rounded-full border-2 border-[#635bff]/25 border-t-[#635bff]" />
        <p className="text-sm font-medium text-slate-600">Checking your session…</p>
      </div>
    </main>
  );
}

export function AuthFormHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#635bff]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function AuthField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const authInputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#a5a0ff] focus:ring-4 focus:ring-[#635bff]/10";

export function AuthSubmitButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-sm font-semibold text-white shadow-sm shadow-[#635bff]/20 transition hover:bg-[#5148e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#635bff]/25 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? (
        <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}

export function AuthErrorMessage({ message }: { message: string }) {
  return (
    <p
      className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-700"
      role="alert"
    >
      {message}
    </p>
  );
}

export function AuthSuccessMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm leading-6 text-emerald-800" role="status">
      <div className="flex items-start gap-2.5">
        <BadgeCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
        <div>{children}</div>
      </div>
    </div>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="grid size-7 place-items-center rounded-lg bg-white/[0.07] text-[#aaa5ff]">
        <ShieldCheck size={15} aria-hidden="true" />
      </span>
      {text}
      <ArrowUpRight size={14} className="ml-auto text-slate-600" aria-hidden="true" />
    </div>
  );
}
