import { workspacePages } from "@/data/navigation";
import type { AuthUser, UserRole } from "@/lib/auth/auth-types";

const rolePages: Record<UserRole, readonly string[]> = {
  ADMIN: workspacePages.map((page) => page.slug),
  STAFF: [
    "dashboard",
    "customers",
    "products",
    "plans",
    "quotations",
    "subscriptions",
    "invoices",
    "payments",
  ],
  CUSTOMER: ["portal"],
};

export function landingPageForRole(role: UserRole): string {
  return role === "CUSTOMER" ? "/portal" : "/dashboard";
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return true;
  return rolePages[role].some(
    (allowed) => segment === allowed || segment.startsWith(`${allowed}/`),
  );
}

export function safeRedirectTarget(
  user: AuthUser,
  requestedPath: string | null,
): string {
  if (
    requestedPath &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    !requestedPath.includes("\\") &&
    canAccessPath(user.role, requestedPath)
  ) {
    return requestedPath;
  }

  return landingPageForRole(user.role);
}

export function canAccessWorkspacePage(role: UserRole, slug: string): boolean {
  return rolePages[role].includes(slug);
}
