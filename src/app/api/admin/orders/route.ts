export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { ordersRepo } from "@/lib/db/repositories";
import { ORDER_STATUS_META, ORDER_STATUSES, normalizeOrderStatus } from "@/lib/order-status";
import { verifyAdminJwt } from "@/lib/admin-jwt";

function toAdminOrder(order: Awaited<ReturnType<typeof ordersRepo.getAll>>[number]) {
  const createdAt = new Date(order.created_at);
  return {
    ...order,
    orderNumber: order.shipping_address?.orderNumber ?? order.id.slice(0, 8).toUpperCase(),
    invoiceNo: order.shipping_address?.invoiceNo ?? `INV-${order.id.slice(0, 8).toUpperCase()}`,
    customer: {
      id: order.customer?.id ?? order.user_id,
      name: order.customer?.name ?? order.shipping_address?.fullName ?? "Customer",
      email: order.customer?.email ?? order.shipping_address?.email ?? "",
      phone: order.customer?.phone ?? order.shipping_address?.phone ?? "",
    },
    total: Number(order.total_price ?? order.shipping_address?.totalAmount ?? 0),
    payment: order.shipping_address?.paymentMethod ?? "cod",
    createdAt: {
      seconds: Number.isFinite(createdAt.getTime()) ? Math.floor(createdAt.getTime() / 1000) : 0,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const order = await ordersRepo.getById(id);
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json({ order: toAdminOrder(order), source: "neon" });
    }

    const orders = await ordersRepo.getAll({
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 200),
    });
    const counts = await ordersRepo.getStatusCounts();
    return NextResponse.json({
      orders: orders.map(toAdminOrder),
      counts,
      statuses: ORDER_STATUSES.map((status) => ({ value: status, ...ORDER_STATUS_META[status] })),
      source: "neon",
    });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const body = await req.json();

    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const status = normalizeOrderStatus(String(body.status));
    const order = await ordersRepo.updateStatus(String(body.id), status, {
      trackingNumber: body.trackingNumber ?? body.tracking_number ?? null,
      adminNote: body.adminNote ?? body.admin_note ?? null,
    });

    return NextResponse.json({ order: toAdminOrder(order), source: "neon" });
  } catch (error) {
    console.error("Admin orders PATCH error:", error);
    const message = error instanceof Error ? error.message : "Failed to update order";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await verifyAdminJwt();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await ordersRepo.delete(id);
    return NextResponse.json({ success: true, source: "neon" });
  } catch (error) {
    console.error("Admin orders DELETE error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete order";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
