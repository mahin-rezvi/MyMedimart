export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { userSettingsRepo } from "@/lib/db/repositories";
import { getCurrentDbUser } from "@/lib/server-auth";

export async function GET() {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const settings = await userSettingsRepo.get(user.id);
    return NextResponse.json({ settings, user, source: "neon" });
  } catch (error) {
    console.error("Account settings GET error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const settings = await userSettingsRepo.update(user.id, body);
    return NextResponse.json({ settings, source: "neon" });
  } catch (error) {
    console.error("Account settings PATCH error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
