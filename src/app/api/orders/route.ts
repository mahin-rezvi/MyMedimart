export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { ordersRepo, usersRepo } from "@/lib/db/repositories";
import { generateOrderNumber } from "@/lib/utils";
import { createInvoicePdf } from "@/lib/invoice";
import { sendMail, getInvoiceCopyEmail } from "@/lib/email";
import { sendWhatsAppOrderNotification } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();

    if (!body.userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    let orderUserId = body.userId;
    const existingUser = await usersRepo.getById(body.userId);
    if (!existingUser) {
      const emailUser = body.email ? await usersRepo.getByEmail(body.email) : null;
      if (emailUser) {
        orderUserId = emailUser.id;
      } else {
        await usersRepo.create({
          id: body.userId,
          email: body.email ?? `user-${body.userId}@example.com`,
          password_hash: undefined,
          name: body.fullName ?? undefined,
          phone: body.phone ?? undefined,
          role: "CUSTOMER",
          is_active: true,
        });
      }
    }

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
      user_id: orderUserId,
      total_price: body.totalAmount,
      status: "CONFIRMED",
      items: body.items,
      shipping_address: shippingAddress,
    });

    const customerEmail = body.email;
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
      notificationStatus: {
        emailSent,
        whatsappSent,
      },
    };
    const updatedOrder = await ordersRepo.updateShippingAddress(order.id, updatedShippingAddress);

    return NextResponse.json({
      ...updatedOrder,
      orderNumber,
      source: "neon",
      notificationStatus: updatedShippingAddress.notificationStatus,
    }, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const rawLimit = Number(searchParams.get('limit') ?? 0);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 50)
      : undefined;

    if (!userId) {
      return NextResponse.json({ error: "userId parameter required" }, { status: 400 });
    }

    const orders = await ordersRepo.getByUserId(userId, limit);
    return NextResponse.json({ orders, source: "neon" });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
