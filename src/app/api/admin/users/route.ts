export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/lib/db/repositories";
import { verifyAdminJwt } from "@/lib/admin-jwt";

export async function GET() {
  try {
    await verifyAdminJwt();
    const users = await usersRepo.getAll();
    return NextResponse.json({ users, source: "neon" });
  } catch (error) {
    console.error("Get users error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const body = await req.json();
    const userId = body.userId ?? body.id;
    const role = body.role;

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }

    if (!["CUSTOMER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await usersRepo.update(String(userId), { role });
    return NextResponse.json({ success: true, user, source: "neon" });
  } catch (error) {
    console.error("Update user error:", error);
    const message = error instanceof Error ? error.message : "Failed to update user";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const body = await req.json();
    const userId = body.userId ?? body.id;

    if (!userId || typeof body.is_active !== "boolean") {
      return NextResponse.json({ error: "userId and is_active are required" }, { status: 400 });
    }

    const user = await usersRepo.update(String(userId), { is_active: body.is_active });
    return NextResponse.json({ success: true, user, source: "neon" });
  } catch (error) {
    console.error("Toggle user status error:", error);
    const message = error instanceof Error ? error.message : "Failed to update user status";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
