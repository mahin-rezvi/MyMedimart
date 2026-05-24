import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/lib/db/repositories";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

/**
 * Login endpoint - called after Firebase auth succeeds
 * Creates/updates user in Neon and returns user data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firebaseUid, email, displayName } = body;

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: "firebaseUid and email are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await usersRepo.getById(firebaseUid);

    if (!user) {
      // Create new user if doesn't exist
      user = await usersRepo.create({
        id: firebaseUid,
        email,
        name: displayName || "",
        role: "CUSTOMER",
        is_active: true,
      });
    } else if (!user.is_active) {
      // Reactivate if deactivated
      user = await usersRepo.update(firebaseUid, { is_active: true });
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
