"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

const EMPTY_FORM = {
  displayName: "",
  phone: "",
  photoURL: "",
  defaultAddress: "",
  city: "",
  postalCode: "",
  dateOfBirth: "",
  gender: "",
  marketingOptIn: false,
  orderUpdatesOptIn: true,
  theme: "system",
  language: "en",
};

export default function AccountEditPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      setForm((prev) => ({
        ...prev,
        displayName: user.displayName ?? "",
        phone: user.phoneNumber ?? "",
        photoURL: user.photoURL ?? "",
      }));

      const res = await fetch("/api/account/settings");
      const data = await res.json();
      if (!res.ok) return;
      const settings = data.settings;
      setForm({
        displayName: settings?.display_name ?? user.displayName ?? "",
        phone: settings?.phone ?? user.phoneNumber ?? "",
        photoURL: settings?.photo_url ?? user.photoURL ?? "",
        defaultAddress: settings?.default_address ?? "",
        city: settings?.city ?? "",
        postalCode: settings?.postal_code ?? "",
        dateOfBirth: settings?.date_of_birth ?? "",
        gender: settings?.gender ?? "",
        marketingOptIn: Boolean(settings?.marketing_opt_in),
        orderUpdatesOptIn: settings?.order_updates_opt_in ?? true,
        theme: settings?.theme ?? "system",
        language: settings?.language ?? "en",
      });
    }

    loadProfile().catch(() => toast.error("Failed to load profile"));
  }, [user]);

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName.trim(),
          phone: form.phone.trim(),
          photoURL: form.photoURL.trim(),
          defaultAddress: form.defaultAddress.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          marketingOptIn: form.marketingOptIn,
          orderUpdatesOptIn: form.orderUpdatesOptIn,
          theme: form.theme,
          language: form.language,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save profile");

      toast.success("Profile updated");
      router.push("/account");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/account" className="btn-ghost p-2 rounded-lg" aria-label="Back to account">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">Keep your contact and delivery details current.</p>
            </div>
          </div>
          {isAdmin && (
            <Link href="/admin/settings" className="btn-outline text-sm px-4 py-2 inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Admin Settings
            </Link>
          )}
        </div>

        {!loading && !user ? (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg">Sign in required</h2>
            <p className="text-sm text-muted-foreground mt-1">You need an account before editing profile settings.</p>
            <Link href="/sign-in?redirect_url=/account/edit" className="btn-primary inline-flex mt-4 px-4 py-2">
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                    <input value={form.displayName} onChange={(e) => update("displayName", e.target.value)} className="form-input" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <input value={user?.email ?? ""} className="form-input bg-muted/50" disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone</label>
                    <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="form-input" placeholder="01XXXXXXXXX" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date of Birth</label>
                    <input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Gender</label>
                    <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className="form-input">
                      <option value="">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold">Delivery Details</h2>
                <div>
                  <label className="text-sm font-medium mb-1 block">Default Address</label>
                  <textarea value={form.defaultAddress} onChange={(e) => update("defaultAddress", e.target.value)} rows={3} className="form-input resize-none" placeholder="House, road, area" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">City</label>
                    <input value={form.city} onChange={(e) => update("city", e.target.value)} className="form-input" placeholder="Dhaka" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Postal Code</label>
                    <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} className="form-input" placeholder="1207" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="font-semibold mb-4">Profile Photo</h2>
                <div className="w-24 h-24 rounded-full bg-muted overflow-hidden mx-auto flex items-center justify-center border border-border">
                  {form.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <label className="text-sm font-medium mb-1 mt-4 block">Photo URL</label>
                <input value={form.photoURL} onChange={(e) => update("photoURL", e.target.value)} className="form-input text-sm" placeholder="https://..." />
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="font-semibold mb-3">Preferences</h2>
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={form.marketingOptIn}
                    onChange={(e) => update("marketingOptIn", e.target.checked)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <span className="text-sm">Send me offers and order updates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={form.orderUpdatesOptIn}
                    onChange={(e) => update("orderUpdatesOptIn", e.target.checked)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <span className="text-sm">Send order status updates</span>
                </label>
                <label className="text-sm font-medium mb-1 block">Theme</label>
                <select value={form.theme} onChange={(e) => update("theme", e.target.value)} className="form-input text-sm mb-3">
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
                <label className="text-sm font-medium mb-1 block">Language</label>
                <select value={form.language} onChange={(e) => update("language", e.target.value)} className="form-input text-sm">
                  <option value="en">English</option>
                  <option value="bn">Bangla</option>
                </select>
              </div>

              <button type="submit" disabled={saving || loading} className="btn-primary w-full flex items-center justify-center gap-2 h-11">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving</> : <><Save className="w-4 h-4" /> Save Profile</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
