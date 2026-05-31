"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Loader2, MapPin, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

interface Address {
  id: string;
  label?: string | null;
  full_name?: string | null;
  phone?: string | null;
  street?: string | null;
  area?: string | null;
  city?: string | null;
  postal_code?: string | null;
  notes?: string | null;
  is_default: boolean;
}

const EMPTY_FORM = {
  label: "Home",
  fullName: "",
  phone: "",
  street: "",
  area: "",
  city: "",
  postalCode: "",
  notes: "",
  isDefault: false,
};

export default function AccountAddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/addresses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load addresses");
      setAddresses(data.addresses ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load addresses");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) void Promise.resolve().then(loadAddresses);
  }, [authLoading, loadAddresses]);

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, fullName: user?.displayName ?? "", phone: user?.phoneNumber ?? "" });
    setShowForm(true);
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setForm({
      label: address.label ?? "Home",
      fullName: address.full_name ?? "",
      phone: address.phone ?? "",
      street: address.street ?? "",
      area: address.area ?? "",
      city: address.city ?? "",
      postalCode: address.postal_code ?? "",
      notes: address.notes ?? "",
      isDefault: address.is_default,
    });
    setShowForm(true);
  };

  const saveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save address");
      toast.success(editingId ? "Address updated" : "Address added");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadAddresses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/account/addresses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to delete address");
      toast.success("Address deleted");
      await loadAddresses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h1 className="font-display text-2xl font-bold">Saved Addresses</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage delivery addresses.</p>
          <Link href="/sign-in?redirect_url=/account/addresses" className="btn-primary inline-flex mt-4 px-4 py-2">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/account" className="btn-ghost p-2 rounded-lg" aria-label="Back to account">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Saved Addresses</h1>
            <p className="text-sm text-muted-foreground">Reuse delivery details during checkout.</p>
          </div>
        </div>
        <button onClick={startCreate} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveAddress} className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? "Edit Address" : "New Address"}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost p-2 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Label</label>
              <input value={form.label} onChange={(e) => update("label", e.target.value)} className="form-input" placeholder="Home, Office" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">City</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Street Address</label>
              <input value={form.street} onChange={(e) => update("street", e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Area/Thana</label>
              <input value={form.area} onChange={(e) => update("area", e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Postal Code</label>
              <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Delivery Notes</label>
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className="form-input resize-none" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => update("isDefault", e.target.checked)} className="w-4 h-4 accent-brand-600" />
            <span className="text-sm">Use as default checkout address</span>
          </label>
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2 px-5 py-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Address
          </button>
        </form>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading || authLoading ? (
          <div className="p-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-10 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-semibold">No saved addresses</h2>
            <p className="text-sm text-muted-foreground mt-1">Add one to speed up checkout.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {addresses.map((address) => (
              <div key={address.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{address.label ?? "Address"}</p>
                    {address.is_default && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address.full_name || "No name"} · {address.phone || "No phone"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[address.street, address.area, address.city, address.postal_code].filter(Boolean).join(", ") || "No address details"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(address)} className="btn-outline inline-flex items-center gap-2 px-3 py-2 text-sm">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => deleteAddress(address.id)} className="btn-ghost inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
