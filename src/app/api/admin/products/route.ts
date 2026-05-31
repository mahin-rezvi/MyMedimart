export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { productsRepo } from "@/lib/db/repositories";
import { verifyAdminJwt } from "@/lib/admin-jwt";

export async function GET(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const product = await productsRepo.getBySlugOrId(id);
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      return NextResponse.json({ product, source: "neon" });
    }

    const rawLimit = searchParams.get("limit");
    const rawOffset = searchParams.get("offset");

    const products = await productsRepo.getAllForAdmin({
      search: searchParams.get("search") ?? undefined,
      limit: rawLimit ? Math.min(Number(rawLimit), 500) : undefined,
      offset: rawOffset ? Number(rawOffset) : undefined,
      status: searchParams.get("status") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    });
    return NextResponse.json({ products, items: products, total: products.length, source: "neon" });
  } catch (error) {
    console.error('Admin products GET error:', error);
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}


export async function POST(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const body = await req.json();
    const product = await productsRepo.create(body);
    return NextResponse.json({ ...product, source: "neon" }, { status: 201 });
  } catch (error) {
    console.error('Admin products POST error:', error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const body = await req.json();
    const { id, _collection, ...updates } = body;
    if (_collection && _collection !== "products") {
      return NextResponse.json({ error: "Unsupported collection" }, { status: 400 });
    }
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const product = await productsRepo.update(id, updates);
    return NextResponse.json({ ...product, source: "neon" });
  } catch (error) {
    console.error('Admin products PUT error:', error);
    const message = error instanceof Error ? error.message : "Failed to update product";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }
    if (!id) {
      return NextResponse.json({ error: "id parameter required" }, { status: 400 });
    }
    await productsRepo.delete(id);
    return NextResponse.json({ success: true, source: "neon" });
  } catch (error) {
    console.error('Admin products DELETE error:', error);
    const message = error instanceof Error ? error.message : "Failed to delete product";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
