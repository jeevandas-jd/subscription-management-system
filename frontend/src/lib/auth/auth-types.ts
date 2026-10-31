export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export type AuthUser = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

export type AuthPayload = {
  email: string;
  password: string;
};

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

export function normalizeAuthUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const id = record.id;
  const email = record.email;
  const firstName = record.first_name;
  const lastName = record.last_name;
  const rawRole = record.role;

  if (
    (typeof id !== "number" && typeof id !== "string") ||
    typeof email !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof rawRole !== "string"
  ) {
    return null;
  }

  const role = rawRole.toUpperCase();
  if (role !== "ADMIN" && role !== "STAFF" && role !== "CUSTOMER") {
    return null;
  }

  return {
    id: String(id),
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    email,
    role,
  };
}
