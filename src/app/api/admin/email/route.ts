import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyUserRole } from "@/lib/auth";
import { query } from "@/lib/db/postgres";
import fs from "fs";
import path from "path";

// Read admin password from file
function getAdminPassword(): string {
  try {
    const passwordPath = path.join(process.cwd(), ".admin-password");
    const password = fs.readFileSync(passwordPath, "utf-8").trim();
    return password;
  } catch (error) {
    console.error("Failed to read admin password:", error);
    return "";
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyUserRole(userId, ["ADMIN", "SUPER_ADMIN"]);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get current admin email from settings
    const result = await query(
      `SELECT storeEmail FROM settings LIMIT 1`
    );

    const currentEmail = result.rows[0]?.storeEmail || "info@medimart.com";

    return NextResponse.json({ email: currentEmail });
  } catch (error) {
    console.error("Error fetching admin email:", error);
    return NextResponse.json({ error: "Failed to fetch email" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyUserRole(userId, ["ADMIN", "SUPER_ADMIN"]);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { password, newEmail } = body;

    // Verify password
    const correctPassword = getAdminPassword();
    if (!correctPassword || password !== correctPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Update email in settings
    await query(
      `UPDATE settings SET storeEmail = $1 WHERE id = (SELECT id FROM settings LIMIT 1)`,
      [newEmail]
    );

    // Also update STORE_EMAIL environment variable reference in environment
    // Log the change for audit purposes
    console.log(`Admin email changed from ${userId} to: ${newEmail}`);

    return NextResponse.json({
      success: true,
      message: "Admin email updated successfully",
      email: newEmail,
    });
  } catch (error) {
    console.error("Error updating admin email:", error);
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 });
  }
}
