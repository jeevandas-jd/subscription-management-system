import type { Metadata } from "next";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create an account" };

export const instant = false;

export default function RegisterPage() {
  return <RegisterForm />;
}
