import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  backendError,
  backendFailureResponse,
  callAuthBackend,
} from "@/lib/auth/auth-server";

const registrationSchema = z.object({
  first_name: z.string().trim().min(1).max(150),
  last_name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(254),
  password: z
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

  const input = registrationSchema.safeParse(payload);
  if (!input.success) {
    return NextResponse.json(
      { detail: "Provide a valid name, email, and password with uppercase, lowercase, and special characters." },
      { status: 400 },
    );
  }

  try {
    const result = await callAuthBackend("auth/register/", {
      method: "POST",
      body: JSON.stringify(input.data),
    });
    if (!result.ok) {
      const error = backendError(result);
      return NextResponse.json({ detail: error.detail }, { status: error.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    return backendFailureResponse(error);
  }
}
