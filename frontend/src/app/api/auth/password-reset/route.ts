import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  backendError,
  backendFailureResponse,
  callAuthBackend,
} from "@/lib/auth/auth-server";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ detail: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = requestSchema.safeParse(payload);
  if (!input.success) {
    return NextResponse.json({ detail: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const result = await callAuthBackend("auth/password-reset/", {
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
