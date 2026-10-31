"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AuthErrorMessage,
  AuthField,
  AuthFormHeading,
  AuthSubmitButton,
  AuthSuccessMessage,
  authInputClass,
} from "@/components/auth/auth-layout";
import { registerCustomer } from "@/lib/auth/auth-service";
import { AuthApiError } from "@/lib/auth/auth-types";

const passwordSchema = z
  .string()
  .min(9, "Use at least 9 characters.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character.");

const schema = z
  .object({
    fullName: z.string().trim().min(3, "Enter your first and last name.").max(100),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((value) => value.fullName.trim().split(/\s+/).length >= 2, {
    message: "Enter both your first and last name.",
    path: ["fullName"],
  });

type RegisterValues = z.infer<typeof schema>;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  async function submit(values: RegisterValues) {
    setRequestError(null);
    const [first_name, ...lastParts] = values.fullName.trim().split(/\s+/);
    const last_name = lastParts.join(" ");
    try {
      await registerCustomer({
        first_name: first_name ?? "",
        last_name,
        email: values.email.trim(),
        password: values.password,
      });
      setCreated(true);
    } catch (error) {
      setRequestError(
        error instanceof AuthApiError && error.status === 503
          ? "Customer registration is not available until the authentication backend is configured."
          : error instanceof Error
            ? error.message
            : "Your account could not be created. Please try again.",
      );
    }
  }

  return (
    <div>
      <AuthFormHeading
        eyebrow="Customer account"
        title="Create your account"
        description="Register for customer access to the Subflow portal."
      />
      {created ? (
        <div className="space-y-5">
          <AuthSuccessMessage>
            Your registration was submitted. You can sign in once your account is ready.
          </AuthSuccessMessage>
          <Link href="/login" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#635bff] px-4 text-sm font-semibold text-white transition hover:bg-[#5148e5]">
            Continue to sign in
          </Link>
        </div>
      ) : (
        <>
          {requestError ? <AuthErrorMessage message={requestError} /> : null}
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
            <AuthField id="register-name" label="Full name" error={form.formState.errors.fullName?.message}>
              <input
                id="register-name"
                autoComplete="name"
                placeholder="e.g. Maya Patel"
                aria-invalid={Boolean(form.formState.errors.fullName)}
                className={authInputClass}
                {...form.register("fullName")}
              />
            </AuthField>
            <AuthField id="register-email" label="Email address" error={form.formState.errors.email?.message}>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                aria-invalid={Boolean(form.formState.errors.email)}
                className={authInputClass}
                {...form.register("email")}
              />
            </AuthField>
            <AuthField id="register-password" label="Password" error={form.formState.errors.password?.message}>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  aria-invalid={Boolean(form.formState.errors.password)}
                  className={`${authInputClass} pr-11`}
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
              <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                At least 9 characters with uppercase, lowercase, and a special character.
              </p>
            </AuthField>
            <AuthField id="register-confirm-password" label="Confirm password" error={form.formState.errors.confirmPassword?.message}>
              <input
                id="register-confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                className={authInputClass}
                {...form.register("confirmPassword")}
              />
            </AuthField>
            <AuthSubmitButton disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating account…" : "Create customer account"}
            </AuthSubmitButton>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#635bff] hover:text-[#5148e5]">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
