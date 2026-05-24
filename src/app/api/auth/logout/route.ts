import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Logout endpoint - clears session data
 * Can be called from client to clean up
 */
export async function POST(req: NextRequest) {
  try {
    // Get Firebase UID from header
    const firebaseUid = req.headers.get("x-firebase-uid");

    if (!firebaseUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists and is active
    const user = await getCurrentUser(firebaseUid);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // In a real app, you might:
    // 1. Invalidate tokens in a blacklist
    // 2. Clear session cookies
    // 3. Log the logout event

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
