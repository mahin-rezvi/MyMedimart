export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { ordersRepo } from "@/lib/db/repositories";
import { generateOrderNumber } from "@/lib/utils";
import { createInvoicePdf } from "@/lib/invoice";
import { sendMail, getStoreContact } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    const shippingAddress = {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      street: body.street,
      area: body.area,
      city: body.city,
      notes: body.notes,
      paymentMethod: body.paymentMethod,
      shippingCost: body.shippingCost,
      subtotal: body.subtotal,
      totalAmount: body.totalAmount,
      orderNumber,
    };

    const order = await ordersRepo.create({
      id: orderId,
      user_id: body.userId,
      total_price: body.totalAmount,
      status: "CONFIRMED",
      items: body.items,
      shipping_address: shippingAddress,
    });

    const customerEmail = body.email;
    const ownerEmail = getStoreContact().email;
    const emailPayload = await createInvoicePdf(order);
    const invoiceNo = `INV-${String(order.id).slice(0, 8).toUpperCase()}`;

    try {
      if (customerEmail) {
        await sendMail({
          to: customerEmail,
          subject: `Your invoice for order ${orderNumber}`,
          text: `Thank you for your purchase. Your invoice (${invoiceNo}) is attached.`,
          html: `<p>Thank you for your purchase.</p><p>Your invoice <strong>${invoiceNo}</strong> is attached.</p>`,
          attachments: [{ filename: `invoice-${invoiceNo}.pdf`, content: emailPayload }],
        });
      }

      if (ownerEmail && ownerEmail !== customerEmail) {
        await sendMail({
          to: ownerEmail,
          subject: `Copy of invoice for order ${orderNumber}`,
          text: `A copy of invoice ${invoiceNo} has been generated for order ${orderNumber}.`,
          html: `<p>A copy of invoice <strong>${invoiceNo}</strong> has been generated for order <strong>${orderNumber}</strong>.</p>`,
          attachments: [{ filename: `invoice-${invoiceNo}.pdf`, content: emailPayload }],
        });
      }
    } catch (emailError) {
      console.error("Invoice email failed:", emailError);
    }

    return NextResponse.json({ ...order, orderNumber, source: "neon" }, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "userId parameter required" }, { status: 400 });
    }

    const orders = await ordersRepo.getByUserId(userId);
    return NextResponse.json({ orders, source: "neon" });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
