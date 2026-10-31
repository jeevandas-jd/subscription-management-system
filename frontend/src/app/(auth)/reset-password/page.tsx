import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export const instant = false;

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
