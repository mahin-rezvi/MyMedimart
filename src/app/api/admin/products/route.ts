export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/admin-guard";

const ALLOWED_COLLECTIONS = ["products", "categories", "orders", "users", "banners", "coupons"];

function normalizeProduct(data: Record<string, unknown>) {
  if (!data.name || typeof data.name !== "string") {
    throw new Error("Product name is required");
  }

  const price = Number(data.price);
  const stock = Number(data.stock);

  if (!Number.isFinite(price) || price < 0) throw new Error("Valid product price is required");
  if (!Number.isFinite(stock) || stock < 0) throw new Error("Valid stock quantity is required");

  return {
    ...data,
    name: data.name.trim(),
    sku: typeof data.sku === "string" ? data.sku.trim() : "",
    price,
    discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
    stock,
    category: typeof data.category === "string" ? data.category.trim() : "",
    brand: typeof data.brand === "string" ? data.brand.trim() : "",
    images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
    tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
    isActive: data.isActive !== false,
    isFeatured: Boolean(data.isFeatured),
    isFlashSale: Boolean(data.isFlashSale),
  };
}

// ─── GET: Admin list any collection ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const limit = parseInt(searchParams.get("limit") ?? "100");
  const collection = searchParams.get("collection") ?? "products";

  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  try {
    const snap = await adminDb().collection(collection).orderBy("createdAt", "desc").limit(limit).get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (q) {
      const lower = q.toLowerCase();
      items = items.filter((p: Record<string, unknown>) =>
        (p.name as string)?.toLowerCase().includes(lower) ||
        (p.sku as string)?.toLowerCase().includes(lower)
      );
    }
    return NextResponse.json({ products: items, items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// ─── POST: Create document ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const { _collection = "products", ...data } = body;
    if (!ALLOWED_COLLECTIONS.includes(_collection)) {
      return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
    }

    const payload = _collection === "products" ? normalizeProduct(data) : data;
    const ref = await adminDb().collection(_collection).add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

// ─── PUT: Update document ─────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const { id, _collection = "products", ...data } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!ALLOWED_COLLECTIONS.includes(_collection)) {
      return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
    }

    const payload = _collection === "products" ? normalizeProduct(data) : data;
    await adminDb().collection(_collection).doc(id).update({
      ...payload,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// ─── DELETE: Delete document ──────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id, _collection = "products" } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!ALLOWED_COLLECTIONS.includes(_collection)) {
      return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
    }

    await adminDb().collection(_collection).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
