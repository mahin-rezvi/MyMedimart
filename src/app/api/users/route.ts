import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/lib/db/repositories";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const email = searchParams.get("email");

    if (userId) {
      const user = await usersRepo.getById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      // Don't expose password hash
      const { password_hash, ...safeUser } = user;
      return NextResponse.json(safeUser);
    }

    if (email) {
      const user = await usersRepo.getByEmail(email);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const { password_hash, ...safeUser } = user;
      return NextResponse.json(safeUser);
    }

    return NextResponse.json({ error: "id or email parameter required" }, { status: 400 });
  } catch (error) {
    console.error("User GET error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, role = "CUSTOMER" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const existing = await usersRepo.getByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const userId = randomUUID();
    const user = await usersRepo.create({
      id: userId,
      email,
      name,
      phone,
      role,
      is_active: true,
    });

    const { password_hash, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error("User POST error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    const user = await usersRepo.update(id, updates);
    const { password_hash, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("User PUT error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
