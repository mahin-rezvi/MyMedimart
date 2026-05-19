"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, Tag } from "lucide-react";
import { toast } from "sonner";

const COUPONS = [
  { id: "1", code: "SAVE20", type: "PERCENTAGE", value: 20, minOrder: 1000, maxUses: 100, usedCount: 43, isActive: true, expires: "2025-12-31" },
  { id: "2", code: "FLASH50", type: "PERCENTAGE", value: 50, minOrder: 500, maxUses: 50, usedCount: 50, isActive: false, expires: "2025-05-10" },
  { id: "3", code: "FLAT200", type: "FIXED", value: 200, minOrder: 2000, maxUses: null, usedCount: 12, isActive: true, expires: null },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState(COUPONS);
  const [showForm, setShowForm] = useState(false);

  const copy = (code: string) => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`); };
  const deleteCoupon = (id: string) => { setCoupons((p) => p.filter((c) => c.id !== id)); toast.success("Coupon deleted"); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Coupons</h1>
          <p className="text-muted-foreground text-sm">Manage discount codes and promotions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 h-10 px-4 text-sm">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 grid sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium mb-1 block">Code</label><input className="form-input" placeholder="e.g. SAVE20" /></div>
          <div><label className="text-sm font-medium mb-1 block">Type</label>
            <select className="form-input"><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed Amount (৳)</option></select>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Value</label><input type="number" className="form-input" placeholder="20" /></div>
          <div><label className="text-sm font-medium mb-1 block">Min Order (৳)</label><input type="number" className="form-input" placeholder="0" /></div>
          <div><label className="text-sm font-medium mb-1 block">Max Uses</label><input type="number" className="form-input" placeholder="Unlimited" /></div>
          <div><label className="text-sm font-medium mb-1 block">Expires At</label><input type="date" className="form-input" /></div>
          <div className="sm:col-span-2"><button className="btn-primary h-10 px-6 text-sm">Save Coupon</button></div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Code</th>
              <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Type</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Discount</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Min Order</th>
              <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Usage</th>
              <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Expires</th>
              <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-brand-600" />
                    <span className="font-mono font-bold">{coupon.code}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-xs text-muted-foreground">{coupon.type}</td>
                <td className="py-3 px-4 text-right font-bold text-green-600">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `৳${coupon.value}`}
                </td>
                <td className="py-3 px-4 text-right text-muted-foreground">৳{coupon.minOrder.toLocaleString()}</td>
                <td className="py-3 px-4 text-center text-sm">
                  {coupon.usedCount}/{coupon.maxUses ?? "∞"}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {coupon.isActive ? "Active" : "Expired"}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">{coupon.expires ?? "No expiry"}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => copy(coupon.code)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteCoupon(coupon.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
