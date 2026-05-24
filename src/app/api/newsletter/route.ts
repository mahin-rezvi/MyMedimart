import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/postgres";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await query(
      "SELECT id FROM newsletter WHERE email = $1 AND unsubscribed_at IS NULL",
      [email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ message: "Already subscribed", email }, { status: 200 });
    }

    // Insert new subscriber
    const id = randomUUID();
    await query(
      "INSERT INTO newsletter (id, email) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET unsubscribed_at = NULL",
      [id, email]
    );

    return NextResponse.json({ message: "Successfully subscribed", email }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
