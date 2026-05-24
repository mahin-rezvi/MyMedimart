import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db/postgres";
import { usersRepo } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

/**
 * Get all users (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Get Firebase UID from header or cookie
    const firebaseUid =
      req.headers.get("x-firebase-uid") ||
      req.cookies.get("x-firebase-uid")?.value;

    if (!firebaseUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await getCurrentUser(firebaseUid);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const users = await query(
      "SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC"
    );

    return NextResponse.json({ users: users.rows }, { status: 200 });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * Update user role (admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    // Get Firebase UID from header or cookie
    const firebaseUid =
      req.headers.get("x-firebase-uid") ||
      req.cookies.get("x-firebase-uid")?.value;

    if (!firebaseUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await getCurrentUser(firebaseUid);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    if (!["CUSTOMER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await usersRepo.update(userId, { role });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * Deactivate/activate user (admin only)
 */
export async function PATCH(req: NextRequest) {
  try {
    // Get Firebase UID from header or cookie
    const firebaseUid =
      req.headers.get("x-firebase-uid") ||
      req.cookies.get("x-firebase-uid")?.value;

    if (!firebaseUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await getCurrentUser(firebaseUid);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, is_active } = body;

    if (!userId || typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "userId and is_active are required" },
        { status: 400 }
      );
    }

    const updatedUser = await usersRepo.update(userId, { is_active });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          is_active: updatedUser.is_active,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Toggle user status error:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
