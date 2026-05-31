export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { dashboardStatsRepo } from "@/lib/db/repositories";
import { verifyAdminJwt } from "@/lib/admin-jwt";
import { ORDER_STATUS_META } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAdminOrder(order: any) {
  const createdAt = new Date(order.created_at);
  const shippingAddress = order.shipping_address as Record<string, unknown> | null | undefined;
  return {
    id: String(order.id),
    orderNumber: (shippingAddress?.orderNumber as string) ?? String(order.id).slice(0, 8).toUpperCase(),
    customer: {
      id: order.customer_id ?? order.user_id,
      name: (order.customer_name as string) ?? (shippingAddress?.fullName as string) ?? "Customer",
      email: (order.customer_email as string) ?? (shippingAddress?.email as string) ?? "",
      phone: (order.customer_phone as string) ?? (shippingAddress?.phone as string) ?? "",
    },
    total: Number(order.total_price ?? shippingAddress?.totalAmount ?? 0),
    status: String(order.status ?? "PENDING"),
    createdAt: {
      seconds: Number.isFinite(createdAt.getTime())
        ? Math.floor(createdAt.getTime() / 1000)
        : 0,
    },
  };
}

export async function GET() {
  try {
    await verifyAdminJwt();
    const stats = await dashboardStatsRepo.get();

    return NextResponse.json({
      productCount: stats.productCount,
      orderCount: stats.orderCount,
      totalRevenue: stats.totalRevenue,
      totalRevenueFormatted: formatPrice(stats.totalRevenue),
      userCount: stats.userCount,
      recentOrders: stats.recentOrders.map(toAdminOrder),
      revenueByDay: stats.revenueByDay,
      ordersByStatus: stats.ordersByStatus,
      orderStatusMeta: ORDER_STATUS_META,
      source: "neon",
    });
  } catch (error) {
    console.error("Admin stats GET error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    const status = message.includes("Unauthorized") || message.includes("admin session") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
