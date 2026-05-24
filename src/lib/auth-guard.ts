import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * Protected API route wrapper
 * Verifies user is authenticated via Firebase and synced to Neon
 */
export async function withAuth(
  handler: (req: NextRequest, firebaseUid: string) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get Firebase UID from Authorization header or cookies
      const authHeader = req.headers.get("authorization");
      let firebaseUid: string | null = null;

      if (authHeader?.startsWith("Bearer ")) {
        firebaseUid = authHeader.slice(7);
      }

      // Fallback to custom header
      if (!firebaseUid) {
        firebaseUid = req.headers.get("x-firebase-uid");
      }

      if (!firebaseUid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify user exists in Neon
      const user = await getCurrentUser(firebaseUid);
      if (!user || !user.is_active) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Call the handler with the authenticated user's UID
      return handler(req, firebaseUid);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Protected route wrapper for admin-only endpoints
 */
export async function withAdminAuth(
  handler: (req: NextRequest, firebaseUid: string) => Promise<NextResponse>
) {
  return withAuth(async (req, firebaseUid) => {
    const user = await getCurrentUser(firebaseUid);

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return handler(req, firebaseUid);
  });
}

/**
 * Protected route wrapper for super admin-only endpoints
 */
export async function withSuperAdminAuth(
  handler: (req: NextRequest, firebaseUid: string) => Promise<NextResponse>
) {
  return withAuth(async (req, firebaseUid) => {
    const user = await getCurrentUser(firebaseUid);

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    return handler(req, firebaseUid);
  });
}
