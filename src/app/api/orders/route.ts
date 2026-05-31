export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cartRepo, ordersRepo, usersRepo } from "@/lib/db/repositories";
import { generateOrderNumber } from "@/lib/utils";
import { createInvoicePdf } from "@/lib/invoice";
import { sendMail, getInvoiceCopyEmail } from "@/lib/email";
import { sendWhatsAppOrderNotification } from "@/lib/whatsapp";
import { getCurrentDbUser } from "@/lib/server-auth";

type IncomingItem = {
  name?: string;
  variant?: string | null;
  qty?: number;
  quantity?: number;
  price?: number;
};

function normalizeItems(items: IncomingItem[] = []) {
  return items
    .map((item) => ({
      name: String(item.name ?? "Product"),
      variant: item.variant ?? null,
      qty: Math.max(1, Number(item.qty ?? item.quantity ?? 1)),
      price: Number(item.price ?? 0),
    }))
    .filter((item) => item.price > 0);
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentDbUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    const orderItems = normalizeItems(body.items);

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }

    const subtotal = Number(body.subtotal ?? orderItems.reduce((sum, item) => sum + item.price * item.qty, 0));
    const shippingCost = Number(body.shippingCost ?? 80);
    const totalAmount = Number(body.totalAmount ?? subtotal + shippingCost);

    await usersRepo.update(currentUser.id, {
      name: body.fullName ? String(body.fullName) : currentUser.name,
      phone: body.phone ? String(body.phone) : currentUser.phone,
    });

    const shippingAddress = {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email ?? currentUser.email,
      street: body.street,
      area: body.area,
      city: body.city,
      notes: body.notes,
      paymentMethod: body.paymentMethod,
      shippingCost,
      subtotal,
      totalAmount,
      orderNumber,
    };

    const order = await ordersRepo.create({
      id: orderId,
      user_id: currentUser.id,
      total_price: totalAmount,
      status: "PENDING",
      items: orderItems,
      shipping_address: shippingAddress,
    });

    const customerEmail = body.email ?? currentUser.email;
    const invoiceCopyEmail = getInvoiceCopyEmail();
    const emailPayload = await createInvoicePdf(order);
    const invoiceNo = `INV-${String(order.id).slice(0, 8).toUpperCase()}`;

    let emailSent = false;
    let whatsappSent = false;

    if (customerEmail) {
      try {
        await sendMail({
          to: customerEmail,
          subject: `Your invoice for order ${orderNumber}`,
          text: `Thank you for your purchase. Your invoice (${invoiceNo}) is attached.`,
          html: `<p>Thank you for your purchase.</p><p>Your invoice <strong>${invoiceNo}</strong> is attached.</p>`,
          attachments: [{ filename: `invoice-${invoiceNo}.pdf`, content: emailPayload }],
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Customer invoice email failed:", emailError);
      }
    }

    try {
      await sendMail({
        to: invoiceCopyEmail,
        subject: `Copy of invoice for order ${orderNumber}`,
        text: `A copy of invoice ${invoiceNo} has been generated for order ${orderNumber}.`,
        html: `<p>A copy of invoice <strong>${invoiceNo}</strong> has been generated for order <strong>${orderNumber}</strong>.</p>`,
        attachments: [{ filename: `invoice-${invoiceNo}.pdf`, content: emailPayload }],
      });
    } catch (emailError) {
      console.error(`Invoice copy email failed for ${invoiceCopyEmail}:`, emailError);
    }

    try {
      whatsappSent = await sendWhatsAppOrderNotification(order);
    } catch (whatsappError) {
      console.error("WhatsApp notification failed:", whatsappError);
    }

    const updatedShippingAddress = {
      ...shippingAddress,
      invoiceNo,
      notificationStatus: {
        emailSent,
        whatsappSent,
      },
    };
    const updatedOrder = await ordersRepo.updateShippingAddress(order.id, updatedShippingAddress);
    await cartRepo.clear(currentUser.id);

    return NextResponse.json(
      {
        ...updatedOrder,
        orderNumber,
        source: "neon",
        notificationStatus: updatedShippingAddress.notificationStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentDbUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId") ?? currentUser.id;
    const rawLimit = Number(searchParams.get("limit") ?? 0);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 50)
      : undefined;

    if (requestedUserId !== currentUser.id && !["ADMIN", "SUPER_ADMIN"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await ordersRepo.getByUserId(requestedUserId, limit);
    return NextResponse.json({ orders, source: "neon" });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
