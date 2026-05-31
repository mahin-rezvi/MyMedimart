import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const ADMIN_SESSION_SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET ?? "fallback-secret-change-in-production"
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      console.error("SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const isValidEmail = email.trim().toLowerCase() === superAdminEmail.toLowerCase();
    const isValidPassword = password === superAdminPassword;

    if (!isValidEmail || !isValidPassword) {
      // Constant-time-ish: always compare both before returning
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Issue a signed JWT (expires in 24h)
    const token = await new SignJWT({
      email,
      role: "SUPER_ADMIN",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(ADMIN_SESSION_SECRET);

    const response = NextResponse.json({
      success: true,
      admin: { email, role: "SUPER_ADMIN" },
    });

    response.cookies.set("admin_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
