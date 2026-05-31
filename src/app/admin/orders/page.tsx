"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Eye, Download, MessageCircle, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { ORDER_STATUS_META, ORDER_STATUSES } from "@/lib/order-status";

interface Order {
  id: string; orderNumber: string; invoiceNo?: string;
  customer: { name: string; phone: string; email?: string };
  total: number; items?: Array<{ qty?: number; quantity?: number }>; status: string; payment?: string;
  createdAt?: { seconds: number };
}

/**
 * Normalize BD phone number for WhatsApp.
 * Ensures exactly one 880 prefix (BD country code), no leading zeros.
 */
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `880${digits.slice(1)}`;
  return `880${digits}`;
}

function getOrdersExportFilename() {
  return `orders-${new Date().toISOString()}.csv`;
}

const ALL_STATUSES = ["All", ...ORDER_STATUSES];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load orders");
      setOrders(data.orders ?? []);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to load orders"); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
      toast.success("Order status updated");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Update failed"); }
  };

  const exportCSV = () => {
    const rows = [["Order#", "Customer", "Phone", "Total", "Status", "Payment", "Date"]];
    filtered.forEach((o) => rows.push([
      o.orderNumber, o.customer?.name ?? "", o.customer?.phone ?? "",
      String(o.total), o.status, o.payment ?? "",
      o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : "",
    ]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = getOrdersExportFilename();
    a.click();
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="btn-ghost p-2 rounded-lg" title="Refresh"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
          <button onClick={exportCSV} className="btn-outline flex items-center gap-2 h-10 px-4 text-sm"><Download className="w-4 h-4" /> Export CSV</button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${statusFilter === s ? "bg-brand-600 text-white" : "bg-card border border-border hover:bg-muted"}`}>
            {s === "All" ? "All" : ORDER_STATUS_META[s as keyof typeof ORDER_STATUS_META]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order or customer…" className="form-input pl-9 h-9 text-sm w-full" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center"><p className="text-muted-foreground">{orders.length === 0 ? "No orders yet" : "No orders match your search"}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Items</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono font-semibold text-xs">{order.orderNumber}</p>
                      {order.invoiceNo && <p className="text-xs text-muted-foreground mt-0.5">{order.invoiceNo}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{order.customer?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{order.customer?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-right font-bold">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4 text-center">{order.items?.reduce((sum, item) => sum + Number(item.qty ?? item.quantity ?? 1), 0) ?? "—"}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-semibold cursor-pointer border-0 outline-none ${ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META]?.className ?? "bg-muted"}`}
                        >
                          {ALL_STATUSES.filter((s) => s !== "All").map((s) => (
                            <option key={s} value={s}>{ORDER_STATUS_META[s as keyof typeof ORDER_STATUS_META]?.label ?? s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-muted-foreground">{order.payment ?? "—"}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-BD") : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/orders/${order.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {order.customer?.phone && (
                          <a href={`https://wa.me/${toWhatsAppNumber(order.customer.phone)}?text=Hi ${encodeURIComponent(order.customer.name)}, your order ${order.orderNumber} status: ${ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META]?.label ?? order.status}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors" title="WhatsApp">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
