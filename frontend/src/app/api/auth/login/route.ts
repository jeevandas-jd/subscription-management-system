import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AuthBackendError,
  backendError,
  backendFailureResponse,
  backendUser,
  callAuthBackend,
  clearAuthCookies,
  storeAuthCookies,
} from "@/lib/auth/auth-server";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ detail: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = loginSchema.safeParse(payload);
  if (!input.success) {
    return NextResponse.json({ detail: "Enter a valid email and password." }, { status: 400 });
  }

  try {
    const result = await callAuthBackend("auth/login/", {
      method: "POST",
      body: JSON.stringify(input.data),
    });
    if (!result.ok) {
      const error = backendError(result);
      const response = NextResponse.json({ detail: error.detail }, { status: error.status });
      if (error.status === 401) clearAuthCookies(response);
      return response;
    }

    const data = result.data;
    if (!data || typeof data !== "object") {
      throw new AuthBackendError(
        "The authentication service returned an invalid login response.",
        502,
      );
    }

    const record = data as Record<string, unknown>;
    const user = backendUser(record.user);
    if (
      typeof record.access !== "string" ||
      typeof record.refresh !== "string" ||
      !user
    ) {
      throw new AuthBackendError(
        "The authentication service returned an unsupported token or user response.",
        502,
      );
    }

    const response = NextResponse.json({ user });
    storeAuthCookies(response, record.access, record.refresh);
    return response;
  } catch (error) {
    return backendFailureResponse(error);
  }
}
