import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SESSION_SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET ?? "fallback-secret-change-in-production"
);

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_jwt")?.value;
    if (!token) return NextResponse.json({ admin: null }, { status: 200 });

    const { payload } = await jwtVerify(token, ADMIN_SESSION_SECRET);

    return NextResponse.json({
      admin: {
        email: payload.email as string,
        role: payload.role as string,
      },
    });
  } catch {
    return NextResponse.json({ admin: null }, { status: 200 });
  }
}
