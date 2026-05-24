export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { productsRepo } from "@/lib/db/repositories";

export async function GET(req: NextRequest) {
  try {
    const products = await productsRepo.getAll();
    return NextResponse.json({ products, items: products, source: "neon" });
  } catch (error) {
    console.error('Admin products GET error:', error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await productsRepo.create(body);
    return NextResponse.json({ ...product, source: "neon" }, { status: 201 });
  } catch (error) {
    console.error('Admin products POST error:', error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    const product = await productsRepo.update(id, updates);
    return NextResponse.json({ ...product, source: "neon" });
  } catch (error) {
    console.error('Admin products PUT error:', error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "id parameter required" }, { status: 400 });
    }
    await productsRepo.delete(id);
    return NextResponse.json({ success: true, source: "neon" });
  } catch (error) {
    console.error('Admin products DELETE error:', error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
