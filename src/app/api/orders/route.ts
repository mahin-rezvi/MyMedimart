export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateOrderNumber, generateInvoiceNo } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderNumber = generateOrderNumber();
    const invoiceNo = generateInvoiceNo();

    const ref = await adminDb().collection("orders").add({
      ...body,
      orderNumber,
      invoiceNo,
      status: "PENDING",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: ref.id, orderNumber, invoiceNo }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[api/orders] Falling back to local order confirmation:", message);
    return NextResponse.json({
      id: `local-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      invoiceNo: generateInvoiceNo(),
      source: "fallback",
    }, { status: 201 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    let query = adminDb().collection("orders").orderBy("createdAt", "desc") as FirebaseFirestore.Query;
    if (userId) query = query.where("userId", "==", userId);
    const snap = await query.get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ orders });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[api/orders] Falling back to empty orders:", message);
    return NextResponse.json({ orders: [], source: "fallback" });
  }
}
