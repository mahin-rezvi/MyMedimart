import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET ?? "fallback-secret-change-in-production"
);

export interface AdminJwtPayload {
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies the admin_jwt cookie and returns its payload.
 * Throws if the cookie is missing or invalid.
 */
export async function verifyAdminJwt(): Promise<AdminJwtPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_jwt")?.value;
  if (!token) throw new Error("Unauthorized: No admin session");

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      email: String(payload.email ?? ""),
      role: String(payload.role ?? "ADMIN"),
    };
  } catch {
    throw new Error("Unauthorized: Invalid or expired admin session");
  }
}

/**
 * Returns true if the request has a valid admin JWT — no throw.
 */
export async function hasValidAdminJwt(): Promise<boolean> {
  try {
    await verifyAdminJwt();
    return true;
  } catch {
    return false;
  }
}
