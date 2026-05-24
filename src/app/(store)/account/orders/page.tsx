"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { formatPrice } from "@/lib/utils";

interface AccountOrder {
  id: string;
  total_price?: number;
  status: string;
  items?: Array<{ qty?: number }>;
  shipping_address?: {
    orderNumber?: string;
    paymentMethod?: string;
  };
  created_at?: string;
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "status-confirmed",
  DELIVERED: "status-delivered",
  PENDING: "status-pending",
  PROCESSING: "status-processing",
  SHIPPED: "status-shipped",
  CANCELLED: "status-cancelled",
};

function getOrderNumber(order: AccountOrder) {
  return order.shipping_address?.orderNumber ?? String(order.id).slice(0, 8).toUpperCase();
}

function getItemCount(order: AccountOrder) {
  return Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + Number(item.qty ?? 1), 0)
    : 0;
}

function formatOrderDate(value?: string) {
  if (!value) return "Date unavailable";
  return new Date(value).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AccountOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user?.uid) return;
    const userId = user.uid;

    async function loadOrders() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [authLoading, user?.uid]);

  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h1 className="font-display text-2xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to view your order history.</p>
          <Link href="/login?redirect=/account/orders" className="btn-primary inline-flex mt-4 px-4 py-2">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Order history is saved once and linked to your account.</p>
        </div>
        <Link href="/account" className="btn-outline px-4 py-2 text-sm">
          Back to Account
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {authLoading || loading ? (
          <div className="p-8 flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-semibold">No orders yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Your confirmed orders will appear here.</p>
            <Link href="/products" className="btn-primary inline-flex mt-4 px-4 py-2">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-mono font-semibold text-sm">{getOrderNumber(order)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatOrderDate(order.created_at)} · {getItemCount(order)} item(s)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment: {order.shipping_address?.paymentMethod ?? "Not specified"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] ?? "bg-muted"}`}>
                    {order.status}
                  </span>
                  <span className="font-bold">{formatPrice(Number(order.total_price ?? 0))}</span>
                  <a href={`/api/invoice/${order.id}`} className="text-xs text-brand-600 hover:underline">
                    Invoice
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
