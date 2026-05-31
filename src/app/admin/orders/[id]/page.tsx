"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_META, ORDER_STATUSES } from "@/lib/order-status";

function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `880${digits.slice(1)}`;
  return `880${digits}`;
}

interface OrderItem {
  name: string;
  variant?: string | null;
  qty?: number;
  quantity?: number;
  price: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  invoiceNo?: string;
  customer: { name: string; phone: string; email?: string };
  total: number;
  status: string;
  payment?: string;
  items?: OrderItem[];
  tracking_number?: string | null;
  admin_note?: string | null;
  shipping_address?: {
    street?: string;
    area?: string;
    city?: string;
    notes?: string;
  };
  createdAt?: { seconds: number };
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("PENDING");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load order");
        setOrder(data.order);
        setStatus(data.order.status);
        setTrackingNumber(data.order.tracking_number ?? "");
        setAdminNote(data.order.admin_note ?? "");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadOrder();
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, trackingNumber, adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update order");
      setOrder(data.order);
      toast.success("Order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8">
        <h1 className="font-display text-xl font-bold">Order not found</h1>
        <button onClick={() => router.push("/admin/orders")} className="btn-primary mt-4">Back to Orders</button>
      </div>
    );
  }

  const address = [order.shipping_address?.street, order.shipping_address?.area, order.shipping_address?.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="btn-ghost p-2 rounded-lg" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">{order.invoiceNo} · {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString("en-BD") : "Date unavailable"}</p>
          </div>
        </div>
        {order.customer.phone && (
          <a
            href={`https://wa.me/${toWhatsAppNumber(order.customer.phone)}?text=Hi ${encodeURIComponent(order.customer.name)}, your order ${order.orderNumber} status is ${ORDER_STATUS_META[status as keyof typeof ORDER_STATUS_META]?.label ?? status}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold">Items</h2>
            </div>
            <div className="divide-y divide-border">
              {(order.items ?? []).map((item, index) => {
                const qty = Number(item.qty ?? item.quantity ?? 1);
                return (
                  <div key={`${item.name}-${index}`} className="p-5 flex justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.variant && <p className="text-sm text-muted-foreground">{item.variant}</p>}
                      <p className="text-xs text-muted-foreground">Qty: {qty}</p>
                    </div>
                    <p className="font-bold">{formatPrice(Number(item.price) * qty)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-3">Customer & Delivery</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-muted-foreground">{order.customer.phone || "No phone"}</p>
                <p className="text-muted-foreground">{order.customer.email || "No email"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{address || "No address"}</p>
                <p className="text-muted-foreground">{order.shipping_address?.notes || "No delivery notes"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Order Status</h2>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-input mb-4">
              {ORDER_STATUSES.map((item) => (
                <option key={item} value={item}>{ORDER_STATUS_META[item].label}</option>
              ))}
            </select>
            <label className="text-sm font-medium mb-1 block">Tracking Number</label>
            <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="form-input mb-4" placeholder="Optional" />
            <label className="text-sm font-medium mb-1 block">Admin Note</label>
            <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} className="form-input resize-none mb-4" placeholder="Internal note" />
            <button onClick={save} disabled={saving} className="btn-primary w-full inline-flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Payment</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium uppercase">{order.payment ?? "cod"}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                <span>Total</span>
                <span>{formatPrice(Number(order.total ?? 0))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
