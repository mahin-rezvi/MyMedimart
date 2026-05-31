import { NextResponse } from "next/server";
import { requireAdminDbUser } from "@/lib/server-auth";
import type { User } from "@/lib/db/types";

/**
 * Require an authenticated admin user (ADMIN or SUPER_ADMIN role).
 * Uses Clerk for identity and Neon PostgreSQL for role verification.
 *
 * Returns { user } on success, or { error: NextResponse } on failure.
 */
export async function requireAdmin(): Promise<
  { user: User; error?: never } | { user?: never; error: NextResponse }
> {
  try {
    const user = await requireAdminDbUser();
    return { user };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    const status = message.includes("Admin") ? 403 : 401;
    return {
      error: NextResponse.json({ error: message }, { status }),
    };
  }
}
