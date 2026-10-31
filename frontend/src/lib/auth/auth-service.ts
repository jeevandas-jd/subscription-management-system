import {
  AuthApiError,
  normalizeAuthUser,
  type AuthUser,
} from "@/lib/auth/auth-types";

type JsonRecord = Record<string, unknown>;

async function requestJson(
  url: string,
  init?: RequestInit,
): Promise<JsonRecord> {
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
    throw new AuthApiError(
      "The authentication service could not be reached. Please try again.",
      503,
    );
  }

  if (response.status === 204) return {};

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "detail" in payload &&
      typeof payload.detail === "string"
        ? payload.detail
        : "The request could not be completed. Please try again.";
    throw new AuthApiError(message, response.status);
  }

  if (!payload || typeof payload !== "object") {
    throw new AuthApiError("The authentication service returned an invalid response.", 502);
  }

  return payload as JsonRecord;
}

function getUser(payload: JsonRecord): AuthUser {
  const user = normalizeAuthUser(payload.user ?? payload);
  if (!user) {
    throw new AuthApiError(
      "The authentication service returned an unsupported user profile or role.",
      502,
    );
  }
  return user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const payload = await requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return getUser(payload);
}

export async function getSession(): Promise<AuthUser | null> {
  const payload = await requestJson("/api/auth/session");
  if (payload.authenticated === false || payload.user === null) return null;
  return getUser(payload);
}

export async function logout(): Promise<void> {
  await requestJson("/api/auth/logout", { method: "POST" });
}

export async function registerCustomer(input: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}): Promise<void> {
  await requestJson("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await requestJson("/api/auth/password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(input: {
  uid: string;
  token: string;
  new_password: string;
}): Promise<void> {
  await requestJson("/api/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
