"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
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
import { confirmPasswordReset } from "@/lib/auth/auth-service";

const passwordSchema = z
  .string()
  .min(9, "Use at least 9 characters.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character.");

const schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [completed, setCompleted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function submit(values: Values) {
    if (!uid || !token) {
      setRequestError("This reset link is incomplete. Request a new password reset link.");
      return;
    }
    setRequestError(null);
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: values.password,
      });
      setCompleted(true);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Your password could not be updated. Request a new reset link and try again.",
      );
    }
  }

  return (
    <div>
      <AuthFormHeading
        eyebrow="Account recovery"
        title="Choose a new password"
        description="Create a secure password for your Subflow account."
      />
      {completed ? (
        <div className="space-y-5">
          <AuthSuccessMessage>Your password has been updated. You can now sign in.</AuthSuccessMessage>
          <Link href="/login" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#635bff] px-4 text-sm font-semibold text-white transition hover:bg-[#5148e5]">
            Continue to sign in
          </Link>
        </div>
      ) : !uid || !token ? (
        <div className="space-y-5">
          <AuthErrorMessage message="This password reset link is incomplete or invalid." />
          <Link href="/forgot-password" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#635bff] px-4 text-sm font-semibold text-white transition hover:bg-[#5148e5]">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <>
          {requestError ? <AuthErrorMessage message={requestError} /> : null}
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
            <AuthField id="new-password" label="New password" error={form.formState.errors.password?.message}>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                aria-invalid={Boolean(form.formState.errors.password)}
                className={authInputClass}
                {...form.register("password")}
              />
              <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                At least 9 characters with uppercase, lowercase, and a special character.
              </p>
            </AuthField>
            <AuthField id="confirm-new-password" label="Confirm new password" error={form.formState.errors.confirmPassword?.message}>
              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                className={authInputClass}
                {...form.register("confirmPassword")}
              />
            </AuthField>
            <AuthSubmitButton disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Updating password…" : "Update password"}
            </AuthSubmitButton>
          </form>
        </>
      )}
    </div>
  );
}
