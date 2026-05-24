import { NextRequest, NextResponse } from "next/server";
import { verifyUserRole } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

export async function requireAdmin(req: NextRequest, firebaseUid: string) {
  try {
    if (!firebaseUid) {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const user = await getCurrentUser(firebaseUid);

    if (!user) {
      return {
        error: NextResponse.json({ error: "User not found" }, { status: 404 }),
      };
    }

    if (!user.is_active) {
      return {
        error: NextResponse.json(
          { error: "Account is deactivated" },
          { status: 403 }
        ),
      };
    }

    const isAdmin = await verifyUserRole(firebaseUid, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);

    if (!isAdmin) {
      return {
        error: NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        ),
      };
    }

    return { user };
  } catch (error) {
    console.error("Admin guard error:", error);
    return {
      error: NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      ),
    };
  }
}
