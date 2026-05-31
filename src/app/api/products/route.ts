export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { productsRepo } from "@/lib/db/repositories";
import { requireAdminDbUser } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const flashSale = searchParams.get('flashSale');

    let products;
    if (id || slug) {
      const product = await productsRepo.getBySlugOrId(String(id ?? slug));
      if (!product) {
        return NextResponse.json({ error: "Product not found", source: "neon" }, { status: 404 });
      }
      return NextResponse.json({ product, source: "neon" });
    } else if (flashSale === 'true') {
      products = await productsRepo.getFlashSale();
    } else if (featured === 'true') {
      products = await productsRepo.getFeatured();
    } else if (category) {
      products = await productsRepo.getByCategory(category);
    } else {
      products = await productsRepo.getAll();
    }

    return NextResponse.json({ products, total: products.length, source: "neon" });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: "Failed to fetch products", source: "neon" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminDbUser();
    const body = await req.json();
    const product = await productsRepo.create(body);
    return NextResponse.json({ ...product, source: "neon" }, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    const status = message.includes("Unauthorized") ? 401 : message.includes("Admin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
