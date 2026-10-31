import { NextResponse } from "next/server";
import {
  normalizeAuthUser,
  type AuthUser,
} from "@/lib/auth/auth-types";

type BackendResult = {
  ok: boolean;
  status: number;
  data: unknown;
};

export class AuthBackendError extends Error {
  status: number;

  constructor(message: string, status = 503) {
    super(message);
    this.name = "AuthBackendError";
    this.status = status;
  }
}

const accessCookieName = "subflow_access";
const refreshCookieName = "subflow_refresh";

function getApiBaseUrl(): string {
  const value = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!value) {
    throw new AuthBackendError(
      "Authentication is not configured. Set API_BASE_URL for the frontend server.",
    );
  }

  return value.replace(/\/+$/, "");
}

export async function callAuthBackend(
  path: string,
  init?: RequestInit,
): Promise<BackendResult> {
  let url: string;
  try {
    url = new URL(`${getApiBaseUrl()}/${path.replace(/^\/+/, "")}`).toString();
  } catch (error) {
    if (error instanceof AuthBackendError) throw error;
    throw new AuthBackendError("The configured authentication API URL is invalid.", 503);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new AuthBackendError(
      "The authentication service is unavailable. Please try again later.",
      503,
    );
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new AuthBackendError(
          "The authentication service returned an invalid response.",
          502,
        );
      }
    }
  }

  return { ok: response.ok, status: response.status, data };
}

export function backendError(result: BackendResult): {
  detail: string;
  status: number;
} {
  if (result.status === 404) {
    return {
      detail: "The backend authentication endpoints are not available yet.",
      status: 503,
    };
  }

  const data = result.data;
  const detail =
    data && typeof data === "object" && "detail" in data &&
    typeof data.detail === "string"
      ? data.detail
      : "The authentication request could not be completed.";

  return { detail, status: result.status };
}

export function backendUser(value: unknown): AuthUser | null {
  return normalizeAuthUser(value);
}

export function storeAuthCookies(
  response: NextResponse,
  access: string,
  refresh?: string,
): void {
  const secure = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set(accessCookieName, access, options);
  if (refresh) response.cookies.set(refreshCookieName, refresh, options);
}

export function clearAuthCookies(response: NextResponse): void {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(accessCookieName, "", options);
  response.cookies.set(refreshCookieName, "", options);
}

export function accessCookieNameForServer(): string {
  return accessCookieName;
}

export function refreshCookieNameForServer(): string {
  return refreshCookieName;
}

export function backendFailureResponse(error: unknown): NextResponse {
  const detail =
    error instanceof AuthBackendError
      ? error.message
      : "The authentication request could not be completed.";
  const status =
    error instanceof AuthBackendError ? error.status : 500;
  return NextResponse.json({ detail }, { status });
}
