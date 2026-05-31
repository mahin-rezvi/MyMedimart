import { query } from "@/lib/db/postgres";

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  is_active: boolean;
};

/**
 * Get current user from Neon database using Clerk user ID
 */
export async function getCurrentUser(clerkUserId: string): Promise<CurrentUser | null> {
  try {
    const result = await query<CurrentUser>(
      `SELECT id, email, name, role, is_active FROM users WHERE id = $1 AND is_active = true`,
      [clerkUserId]
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
  clerkUserId: string,
  requiredRoles: string[]
): Promise<boolean> {
  const user = await getCurrentUser(clerkUserId);
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

/**
 * Check if user is admin
 */
export async function isAdmin(clerkUserId: string): Promise<boolean> {
  return verifyUserRole(clerkUserId, ["ADMIN", "SUPER_ADMIN"]);
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(clerkUserId: string): Promise<boolean> {
  return verifyUserRole(clerkUserId, ["SUPER_ADMIN"]);
}

/**
 * Disable/deactivate user account
 */
export async function deactivateUser(clerkUserId: string): Promise<void> {
  await query("UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1", [
    clerkUserId,
  ]);
}

/**
 * Update user role
 */
export async function updateUserRole(clerkUserId: string, role: string): Promise<void> {
  if (!["CUSTOMER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    throw new Error("Invalid role");
  }
  await query("UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2", [
    role,
    clerkUserId,
  ]);
}
