import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  backendError,
  backendFailureResponse,
  callAuthBackend,
} from "@/lib/auth/auth-server";

const confirmSchema = z.object({
  uid: z.string().min(1),
  token: z.string().min(1),
  new_password: z
    .string()
    .min(9)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[^A-Za-z0-9]/),
});

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ detail: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = confirmSchema.safeParse(payload);
  if (!input.success) {
    return NextResponse.json(
      { detail: "Enter a valid reset link and a password that meets the listed requirements." },
      { status: 400 },
    );
  }

  try {
    const result = await callAuthBackend("auth/password-reset/confirm/", {
      method: "POST",
      body: JSON.stringify(input.data),
    });
    if (!result.ok) {
      const error = backendError(result);
      return NextResponse.json({ detail: error.detail }, { status: error.status });
    }

    return NextResponse.json(result.data ?? { message: "Password updated." }, {
      status: result.status,
    });
  } catch (error) {
    return backendFailureResponse(error);
  }
}
