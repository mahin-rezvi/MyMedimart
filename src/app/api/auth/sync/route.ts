import { NextRequest, NextResponse } from "next/server";
import { syncFirebaseUserToNeon } from "@/lib/db/auth-sync";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, email, displayName } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: "uid and email are required" },
        { status: 400 }
      );
    }

    // Create a Firebase user object to pass to sync
    const firebaseUser = {
      uid,
      email,
      displayName: displayName || "",
      phoneNumber: null,
      photoURL: null,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: "",
      getIdToken: async () => "",
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
    };

    await syncFirebaseUserToNeon(firebaseUser as any);

    return NextResponse.json(
      { success: true, message: "User synced to Neon" },
      { status: 200 }
    );
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
