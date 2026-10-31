import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthBackendError,
  accessCookieNameForServer,
  backendError,
  backendFailureResponse,
  backendUser,
  callAuthBackend,
  clearAuthCookies,
  refreshCookieNameForServer,
  storeAuthCookies,
} from "@/lib/auth/auth-server";

async function refreshAccessToken(
  refresh: string,
): Promise<{ access?: string; status: number }> {
  const result = await callAuthBackend("auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
  if (!result.ok) return { status: result.status };

  const data = result.data;
  if (!data || typeof data !== "object" || !("access" in data) || typeof data.access !== "string") {
    throw new AuthBackendError(
      "The authentication service returned an invalid refresh response.",
      502,
    );
  }
  return { access: data.access, status: result.status };
}

export async function GET() {
  const cookieStore = await cookies();
  const access = cookieStore.get(accessCookieNameForServer())?.value;
  const refresh = cookieStore.get(refreshCookieNameForServer())?.value;

  if (!access && !refresh) {
    const response = NextResponse.json({ authenticated: false });
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  try {
    let activeAccess = access;
    let wasRefreshed = false;
    if (!activeAccess && refresh) {
      const refreshResult = await refreshAccessToken(refresh);
      activeAccess = refreshResult.access;
      wasRefreshed = Boolean(activeAccess);
      if (!activeAccess && refreshResult.status !== 400 && refreshResult.status !== 401) {
        const error = backendError({
          ok: false,
          status: refreshResult.status,
          data: null,
        });
        return NextResponse.json({ detail: error.detail }, { status: error.status });
      }
    }

    if (!activeAccess) {
      const response = NextResponse.json({ authenticated: false });
      clearAuthCookies(response);
      response.headers.set("Cache-Control", "no-store");
      return response;
    }

    let result = await callAuthBackend("auth/me/", {
      headers: { Authorization: `Bearer ${activeAccess}` },
    });

    if (result.status === 401 && refresh && !wasRefreshed) {
      const refreshResult = await refreshAccessToken(refresh);
      activeAccess = refreshResult.access;
      if (activeAccess) {
        wasRefreshed = true;
        result = await callAuthBackend("auth/me/", {
          headers: { Authorization: `Bearer ${activeAccess}` },
        });
      } else if (refreshResult.status !== 400 && refreshResult.status !== 401) {
        const error = backendError({
          ok: false,
          status: refreshResult.status,
          data: null,
        });
        return NextResponse.json({ detail: error.detail }, { status: error.status });
      }
    }

    if (!result.ok) {
      const error = backendError(result);
      if (error.status === 401) {
        const response = NextResponse.json({ authenticated: false });
        clearAuthCookies(response);
        response.headers.set("Cache-Control", "no-store");
        return response;
      }
      const response = NextResponse.json(
        { detail: error.detail },
        { status: error.status },
      );
      return response;
    }

    const user = backendUser(result.data);
    if (!user) {
      throw new AuthBackendError(
        "The authentication service returned an unsupported user profile or role.",
        502,
      );
    }

    const response = NextResponse.json({ authenticated: true, user });
    response.headers.set("Cache-Control", "no-store");
    if (wasRefreshed && activeAccess) storeAuthCookies(response, activeAccess);
    return response;
  } catch (error) {
    return backendFailureResponse(error);
  }
}
