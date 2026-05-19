import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("__session")?.value;

  if (!token) {
    return {
      error: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const userSnap = await adminDb().collection("users").doc(decoded.uid).get();
    const role = userSnap.exists ? userSnap.data()?.role : null;

    if (!ADMIN_ROLES.has(role)) {
      return {
        error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
      };
    }

    return { uid: decoded.uid, role };
  } catch (err) {
    console.error("[admin-guard] Failed to verify admin session:", err);
    return {
      error: NextResponse.json({ error: "Invalid session" }, { status: 401 }),
    };
  }
}
