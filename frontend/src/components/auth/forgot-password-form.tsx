"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
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
import { requestPasswordReset } from "@/lib/auth/auth-service";
import { AuthApiError } from "@/lib/auth/auth-types";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function submit(values: Values) {
    setRequestError(null);
    try {
      await requestPasswordReset(values.email.trim());
      setSubmitted(true);
    } catch (error) {
      setRequestError(
        error instanceof AuthApiError && error.status === 503
          ? "Password reset is not available until the authentication backend is configured."
          : "We could not process the request right now. Please try again later.",
      );
    }
  }

  return (
    <div>
      <AuthFormHeading
        eyebrow="Account recovery"
        title="Forgot your password?"
        description="Enter the email address associated with your account and we’ll send reset instructions if it exists."
      />
      {submitted ? (
        <div className="space-y-5">
          <AuthSuccessMessage>
            If an account exists for that email, a password reset link will be sent.
          </AuthSuccessMessage>
          <Link href="/login" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft size={15} aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          {requestError ? <AuthErrorMessage message={requestError} /> : null}
          <form className="mt-6 space-y-5" onSubmit={form.handleSubmit(submit)} noValidate>
            <AuthField id="recovery-email" label="Email address" error={form.formState.errors.email?.message}>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  className={`${authInputClass} pl-10`}
                  {...form.register("email")}
                />
              </div>
            </AuthField>
            <AuthSubmitButton disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending request…" : "Send reset link"}
            </AuthSubmitButton>
          </form>
          <Link href="/login" className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#635bff]">
            <ArrowLeft size={15} aria-hidden="true" />
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}
