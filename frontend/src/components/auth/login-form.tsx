"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AuthErrorMessage,
  AuthField,
  AuthFormHeading,
  AuthSubmitButton,
  authInputClass,
} from "@/components/auth/auth-layout";
import { useAuth } from "@/lib/auth/auth-context";
import { AuthApiError } from "@/lib/auth/auth-types";
import { safeRedirectTarget } from "@/lib/auth/permissions";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function submit(values: LoginValues) {
    setRequestError(null);
    try {
      const user = await signIn(values.email.trim(), values.password);
      router.replace(safeRedirectTarget(user, searchParams.get("next")));
    } catch (error) {
      setRequestError(
        error instanceof AuthApiError && error.status === 401
          ? "The email or password is incorrect."
          : error instanceof Error
            ? error.message
            : "Sign-in failed. Please try again.",
      );
    }
  }

  return (
    <div>
      <AuthFormHeading
        eyebrow="Welcome back"
        title="Sign in to Subflow"
        description="Use your workspace credentials to continue."
      />
      {requestError ? <AuthErrorMessage message={requestError} /> : null}
      <form className="mt-6 space-y-4.5" onSubmit={form.handleSubmit(submit)} noValidate>
        <AuthField id="login-email" label="Email address" error={form.formState.errors.email?.message}>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              aria-invalid={Boolean(form.formState.errors.email)}
              className={`${authInputClass} pl-10`}
              {...form.register("email")}
            />
          </div>
        </AuthField>
        <AuthField id="login-password" label="Password" error={form.formState.errors.password?.message}>
          <div className="relative">
            <LockKeyhole size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(form.formState.errors.password)}
              className={`${authInputClass} pl-10 pr-11`}
              {...form.register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </AuthField>
        <div className="-mt-1 flex justify-end">
          <Link href="/forgot-password" className="text-xs font-semibold text-[#635bff] hover:text-[#5148e5]">
            Forgot password?
          </Link>
        </div>
        <AuthSubmitButton disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </AuthSubmitButton>
      </form>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Demo quick sign-in
        </p>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              form.setValue("email", "admin@example.com");
              form.setValue("password", "Admin@123");
              void form.handleSubmit(submit)();
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => {
              form.setValue("email", "staff@example.com");
              form.setValue("password", "Staff@123");
              void form.handleSubmit(submit)();
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => {
              form.setValue("email", "ananya.sharma@example.com");
              form.setValue("password", "Customer@123");
              void form.handleSubmit(submit)();
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Customer
          </button>
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        New to Subflow?{" "}
        <Link href="/register" className="font-semibold text-[#635bff] hover:text-[#5148e5]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
