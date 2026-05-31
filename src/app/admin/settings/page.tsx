"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Store, Globe, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? "MediMart",
    storeEmail: "info@medimart.com",
    storePhone: "01781452943",
    storeAddress: "Dhaka, Bangladesh",
    currency: "BDT",
    currencySymbol: "৳",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    freeShippingThreshold: "1000",
    standardShippingCost: "80",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (!res.ok) return;
        const settings = data.settings;
        setForm((prev) => ({
          ...prev,
          storeName: settings.storeName ?? prev.storeName,
          storeEmail: settings.storeEmail ?? prev.storeEmail,
          storePhone: settings.storePhone ?? prev.storePhone,
          storeAddress: settings.storeAddress ?? prev.storeAddress,
          currency: settings.currency ?? prev.currency,
          currencySymbol: settings.currencySymbol ?? prev.currencySymbol,
          appUrl: settings.appUrl ?? prev.appUrl,
          freeShippingThreshold: String(settings.freeShippingThreshold ?? prev.freeShippingThreshold),
          standardShippingCost: String(settings.standardShippingCost ?? prev.standardShippingCost),
        }));
      } catch {}
    }

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          freeShippingThreshold: Number(form.freeShippingThreshold),
          standardShippingCost: Number(form.standardShippingCost),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save settings");
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your store settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Store className="w-4 h-4" /> Store Information</h2>
          <div><label className="text-sm font-medium mb-1 block">Store Name</label><input value={form.storeName} onChange={(e) => update("storeName", e.target.value)} className="form-input" /></div>
          <div><label className="text-sm font-medium mb-1 block">Store Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="email" value={form.storeEmail} onChange={(e) => update("storeEmail", e.target.value)} className="form-input pl-10" /></div></div>
          <div><label className="text-sm font-medium mb-1 block">Store Phone</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={form.storePhone} onChange={(e) => update("storePhone", e.target.value)} className="form-input pl-10" /></div></div>
          <div><label className="text-sm font-medium mb-1 block">Address</label><input value={form.storeAddress} onChange={(e) => update("storeAddress", e.target.value)} className="form-input" /></div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4" /> App Configuration</h2>
          <div><label className="text-sm font-medium mb-1 block">App URL</label><input value={form.appUrl} onChange={(e) => update("appUrl", e.target.value)} className="form-input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Currency Code</label><input value={form.currency} onChange={(e) => update("currency", e.target.value)} className="form-input" /></div>
            <div><label className="text-sm font-medium mb-1 block">Currency Symbol</label><input value={form.currencySymbol} onChange={(e) => update("currencySymbol", e.target.value)} className="form-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Free Shipping Threshold</label><input type="number" value={form.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", e.target.value)} className="form-input" /></div>
            <div><label className="text-sm font-medium mb-1 block">Standard Shipping Cost</label><input type="number" value={form.standardShippingCost} onChange={(e) => update("standardShippingCost", e.target.value)} className="form-input" /></div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 h-10 px-6">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>
      </form>
    </div>
  );
}
