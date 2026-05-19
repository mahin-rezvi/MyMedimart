export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-guard";

// ─── GET: Export Firestore collection as JSON ─────────────────────────────────
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "products";

  const allowed = ["products", "categories", "orders", "users", "banners", "coupons"];
  if (!allowed.includes(type)) {
    return NextResponse.json({ error: "Invalid collection type" }, { status: 400 });
  }

  try {
    const snap = await adminDb().collection(type).get();
    const data = snap.docs.map((d) => {
      const raw = d.data();
      // Convert Firestore Timestamps to ISO strings for JSON
      const cleaned: Record<string, unknown> = { id: d.id };
      for (const [k, v] of Object.entries(raw)) {
        if (v && typeof v === "object" && "toDate" in v) {
          cleaned[k] = (v as { toDate: () => Date }).toDate().toISOString();
        } else {
          cleaned[k] = v;
        }
      }
      return cleaned;
    });

    const json = JSON.stringify(data, null, 2);
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${type}-export-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
