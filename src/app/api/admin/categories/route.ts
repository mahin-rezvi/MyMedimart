export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { categoriesRepo } from "@/lib/db/repositories";
import { verifyAdminJwt } from "@/lib/admin-jwt";

export async function GET() {
  try {
    await verifyAdminJwt();
    const categories = await categoriesRepo.getAll(true);
    return NextResponse.json({ categories, source: "neon" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load categories";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const body = await req.json();
    const category = await categoriesRepo.create(body);
    return NextResponse.json({ category, source: "neon" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const category = await categoriesRepo.update(String(body.id), body);
    return NextResponse.json({ category, source: "neon" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await categoriesRepo.delete(id);
    return NextResponse.json({ success: true, source: "neon" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
