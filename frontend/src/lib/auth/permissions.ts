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
    "discounts",
    "billing",
    "analytics",
  ],
  CUSTOMER: [
    "portal",
    "quotations",
    "subscriptions",
    "invoices",
    "payments",
    "billing",
  ],
};

export function landingPageForRole(role: UserRole): string {
  return role === "CUSTOMER" ? "/portal" : "/dashboard";
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return true;
  const pathSegments = pathname.split("/").filter(Boolean);

  // Customer restricted from internal modules
  if (role === "CUSTOMER") {
    if (["discounts", "analytics", "dashboard", "customers", "products", "plans", "settings"].includes(segment)) {
      return false;
    }
    if (
      ["quotations", "subscriptions", "invoices", "payments", "billing", "portal"].includes(segment)
    ) {
      if (pathSegments[1] === "new" || pathSegments[2] === "edit") {
        return false;
      }
      return true;
    }
  }

  // Staff and other roles restricted from discount management (admin-only)
  if (
    segment === "discounts" &&
    role !== "ADMIN" &&
    (pathSegments[1] === "new" || pathSegments[2] === "edit")
  ) {
    return false;
  }

  // Staff restricted from catalog mutations (admin-only)
  const isCatalogMutation =
    (segment === "products" || segment === "plans") &&
    (pathSegments[1] === "new" || pathSegments[2] === "edit");
  if (isCatalogMutation && role !== "ADMIN") return false;

  return rolePages[role].some(
    (allowed) => segment === allowed || segment.startsWith(`${allowed}/`),
  );
}

export function canManageCatalog(role: UserRole): boolean {
  return role === "ADMIN";
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
