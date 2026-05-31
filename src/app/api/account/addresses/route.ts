export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { userAddressesRepo } from "@/lib/db/repositories";
import { getCurrentDbUser } from "@/lib/server-auth";

async function getUserOrResponse() {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  return user;
}

export async function GET() {
  try {
    const user = await getUserOrResponse();
    if (user instanceof NextResponse) return user;

    const addresses = await userAddressesRepo.getAll(user.id);
    return NextResponse.json({ addresses, source: "neon" });
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ error: "Failed to load addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserOrResponse();
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    const address = await userAddressesRepo.create(user.id, body);
    return NextResponse.json({ address, source: "neon" }, { status: 201 });
  } catch (error) {
    console.error("Addresses POST error:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserOrResponse();
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const address = await userAddressesRepo.update(user.id, String(body.id), body);
    return NextResponse.json({ address, source: "neon" });
  } catch (error) {
    console.error("Addresses PATCH error:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserOrResponse();
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await userAddressesRepo.delete(user.id, id);
    return NextResponse.json({ success: true, source: "neon" });
  } catch (error) {
    console.error("Addresses DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
