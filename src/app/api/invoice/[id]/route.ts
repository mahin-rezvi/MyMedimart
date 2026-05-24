import { NextRequest, NextResponse } from "next/server";
import { ordersRepo } from "@/lib/db/repositories";
import { createInvoicePdf } from "@/lib/invoice";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const order = await ordersRepo.getById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const pdfBuffer = await createInvoicePdf(order);
    const invoiceNo = `invoice-${String(order.id).slice(0, 8).toUpperCase()}`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice GET error:", error);
    return NextResponse.json({ error: "Unable to generate invoice" }, { status: 500 });
  }
}
