export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { productsRepo } from "@/lib/db/repositories";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const flashSale = searchParams.get('flashSale');

    let products;
    if (flashSale === 'true') {
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
    const body = await req.json();
    const product = await productsRepo.create(body);
    return NextResponse.json({ ...product, source: "neon" }, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
