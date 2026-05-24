import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  is_active: boolean;
};

/**
 * Get current user from Neon database using Firebase UID
 */
export async function getCurrentUser(firebaseUid: string): Promise<CurrentUser | null> {
  try {
    const result = await query<CurrentUser>(
      `SELECT id, email, name, role, is_active FROM users WHERE id = $1 AND is_active = true`,
      [firebaseUid]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

/**
 * Verify user has required role
 */
export async function verifyUserRole(
  firebaseUid: string,
  requiredRoles: string[]
): Promise<boolean> {
  const user = await getCurrentUser(firebaseUid);
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

/**
 * Create JWT token for user session
 */
export async function createUserToken(firebaseUid: string): Promise<string> {
  const user = await getCurrentUser(firebaseUid);
  if (!user) throw new Error("User not found");

  const token = await new SignJWT({
    uid: firebaseUid,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract user from Firebase auth header
 */
export async function getUserFromHeaders(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const firebaseToken = authHeader.slice(7);
  
  // In a real app, verify Firebase token here
  // For now, we're using the Firebase UID directly
  try {
    // Return user from Neon based on Firebase token
    // This would require verifying the Firebase token
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(firebaseUid: string): Promise<boolean> {
  return verifyUserRole(firebaseUid, ["ADMIN", "SUPER_ADMIN"]);
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(firebaseUid: string): Promise<boolean> {
  return verifyUserRole(firebaseUid, ["SUPER_ADMIN"]);
}

/**
 * Disable/deactivate user account
 */
export async function deactivateUser(firebaseUid: string): Promise<void> {
  await query("UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1", [
    firebaseUid,
  ]);
}

/**
 * Update user role
 */
export async function updateUserRole(firebaseUid: string, role: string): Promise<void> {
  if (!["CUSTOMER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    throw new Error("Invalid role");
  }
  await query("UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2", [
    role,
    firebaseUid,
  ]);
}
