export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ─── GET: List products with optional filters ─────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const slug = searchParams.get("slug");
  const featured = searchParams.get("featured");
  const flashSale = searchParams.get("flashSale");
  const limit = parseInt(searchParams.get("limit") ?? "24");

  try {
    let query = adminDb().collection("products").where("isActive", "==", true) as FirebaseFirestore.Query;
    if (category) query = query.where("category", "==", category);
    if (slug) query = query.where("slug", "==", slug);
    if (featured === "true") query = query.where("isFeatured", "==", true);
    if (flashSale === "true") query = query.where("isFlashSale", "==", true);
    query = query.orderBy("createdAt", "desc").limit(limit);

    const snap = await query.get();
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ products, total: products.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[api/products] Falling back to sample products:", message);
    return NextResponse.json({ products: [], total: 0, source: "fallback" });
  }
}

// ─── POST: Create product (admin only) ────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = await adminDb().collection("products").add({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
