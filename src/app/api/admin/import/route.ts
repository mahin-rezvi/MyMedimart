export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-guard";

interface ImportItem extends Record<string, unknown> {
  name?: string;
  slug?: string;
}

// ─── POST: Batch import JSON to Firestore ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { type, data } = await req.json();

    if (!type || !data) return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
    if (!Array.isArray(data)) return NextResponse.json({ error: "Data must be an array" }, { status: 400 });

    const collectionName = type === "products" ? "products"
      : type === "categories" ? "categories"
      : type === "brands" ? "brands"
      : null;

    if (!collectionName) return NextResponse.json({ error: "Invalid type. Use: products, categories, brands" }, { status: 400 });

    const batch = adminDb().batch();
    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < data.length; i++) {
      const item: ImportItem = data[i];
      if (!item.name) { errors.push(`Item ${i + 1}: missing "name" field`); continue; }

      const ref = adminDb().collection(collectionName).doc();
      const slug = item.slug || slugify(item.name);
      const price = item.price === undefined ? undefined : Number(item.price);
      const stock = item.stock === undefined ? undefined : Number(item.stock);

      if (type === "products" && (!Number.isFinite(price) || !Number.isFinite(stock))) {
        errors.push(`Item ${i + 1}: products require numeric "price" and "stock" fields`);
        continue;
      }

      batch.set(ref, {
        ...item,
        slug,
        ...(price !== undefined ? { price } : {}),
        ...(stock !== undefined ? { stock } : {}),
        isActive: item.isActive !== undefined ? item.isActive : true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      imported++;
    }

    await batch.commit();
    return NextResponse.json({ imported, errors, total: data.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
