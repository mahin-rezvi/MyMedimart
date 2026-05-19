import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const entry = adminDb().collection("newsletter").doc(email);
    const snapshot = await entry.get();
    if (snapshot.exists) {
      return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
    }

    await entry.set({
      email,
      subscribedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch (error) {
    console.error("[newsletter]", error);
    return NextResponse.json({ error: "Unable to subscribe" }, { status: 500 });
  }
}
