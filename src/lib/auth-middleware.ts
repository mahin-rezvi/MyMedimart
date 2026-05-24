import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifyUserRole, isSuperAdmin } from "@/lib/auth";

/**
 * Middleware to verify user authentication from Firebase
 * Can be used to protect API routes
 */
export async function verifyAuthenticated(
  request: NextRequest,
  firebaseUid: string
) {
  const user = await getCurrentUser(firebaseUid);

  if (!user) {
    return {
      authenticated: false,
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!user.is_active) {
    return {
      authenticated: false,
      user: null,
      response: NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      ),
    };
  }

  return {
    authenticated: true,
    user,
    response: null,
  };
}

/**
 * Middleware to verify user has admin role
 */
export async function verifyAdminRole(
  request: NextRequest,
  firebaseUid: string
) {
  const auth = await verifyAuthenticated(request, firebaseUid);

  if (!auth.authenticated) {
    return auth;
  }

  const isAdminUser = await verifyUserRole(firebaseUid, [
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  if (!isAdminUser) {
    return {
      authenticated: false,
      user: null,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Middleware to verify user has super admin role
 */
export async function verifySuperAdminRole(
  request: NextRequest,
  firebaseUid: string
) {
  const auth = await verifyAuthenticated(request, firebaseUid);

  if (!auth.authenticated) {
    return auth;
  }

  const isSuperAdminUser = await isSuperAdmin(firebaseUid);

  if (!isSuperAdminUser) {
    return {
      authenticated: false,
      user: null,
      response: NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Extract Firebase UID from request
 * In a real app, this would verify the Firebase token
 */
export function getFirebaseUidFromRequest(
  request: NextRequest
): string | null {
  // Get from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Get from cookie (Firebase sets auth cookie)
  const cookies = request.cookies;
  const firebaseAuth = cookies.get("__session")?.value;
  if (firebaseAuth) {
    try {
      // This would need to decode Firebase token
      return firebaseAuth;
    } catch (error) {
      return null;
    }
  }

  return null;
}
