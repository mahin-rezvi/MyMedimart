"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Heart, MapPin, ChevronRight, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ORDER_STATUS_META } from "@/lib/order-status";

interface ProfileDoc {
  displayName?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  role?: string;
  defaultAddress?: string;
  marketingOptIn?: boolean;
}

interface RecentOrder {
  id: string;
  total_price?: number;
  status: string;
  items?: Array<{ qty?: number }>;
  shipping_address?: { orderNumber?: string };
  created_at?: string;
}

function getOrderNumber(order: RecentOrder) {
  return order.shipping_address?.orderNumber ?? String(order.id).slice(0, 8).toUpperCase();
}

function getOrderItemCount(order: RecentOrder) {
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

export default function AccountPage() {
  const { user, loading, isAdmin } = useAuth();
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const res = await fetch("/api/account/settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load profile");
        const settings = data.settings;
        setProfile({
          displayName: settings?.display_name,
          email: user.email ?? "",
          phone: settings?.phone,
          photoURL: settings?.photo_url,
          role: user.role,
          defaultAddress: settings?.default_address,
          marketingOptIn: Boolean(settings?.marketing_opt_in),
        });
      } catch {
        setProfile(null);
      }
    }

    loadProfile();
  }, [user]);

  useEffect(() => {
    async function loadOrders() {
      if (!user?.uid) {
        setRecentOrders([]);
        return;
      }

      try {
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(user.uid)}&limit=3`);
        const data = await res.json();
        setRecentOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch {
        setRecentOrders([]);
      }
    }

    loadOrders();
  }, [user?.uid]);

  const name = profile?.displayName || user?.displayName || "MediMart customer";
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || user?.phoneNumber || "No phone saved";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "M";

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Account Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage profile, orders, addresses, and account settings.</p>
          </div>
          {isAdmin && (
            <Link href="/admin" className="btn-outline text-sm px-4 py-2 inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}
        </div>

        {!loading && !user && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-lg">Sign in to manage your account</h2>
            <p className="text-sm text-muted-foreground mt-1">Your profile, order history, wishlist, and saved addresses appear here after login.</p>
            <Link href="/sign-in?redirect_url=/account" className="btn-primary inline-flex mt-4 px-4 py-2">
              Sign In
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            {profile?.photoURL || user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile?.photoURL || user?.photoURL || ""} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border border-border" />
            ) : (
              <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-600 font-bold text-2xl">
                {initials}
              </div>
            )}
            <h2 className="font-semibold text-lg">{name}</h2>
            <p className="text-muted-foreground text-sm break-all">{email}</p>
            <p className="text-muted-foreground text-sm">{phone}</p>
            <span className="inline-flex mt-3 px-2.5 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {profile?.role || user?.role || "CUSTOMER"}
            </span>
            <Link href="/account/edit" className="btn-outline mt-4 text-sm px-4 py-2 inline-flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Profile Settings
            </Link>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { href: "/account/orders",    icon: Package, label: "My Orders", desc: "View all your orders" },
              { href: "/account/wishlist",  icon: Heart,   label: "Wishlist",  desc: "Saved items" },
              { href: "/account/addresses", icon: MapPin,  label: "Addresses", desc: "Manage delivery addresses" },
              { href: "/account/edit", icon: Settings, label: "Settings", desc: "Update profile preferences" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-card border border-border rounded-2xl p-5 hover:border-brand-400 hover:shadow-md transition-all group flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <link.icon className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{link.label}</p>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold">Profile Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Default Address</p>
              <p className="font-medium mt-1">{profile?.defaultAddress || "Not set"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Marketing Updates</p>
              <p className="font-medium mt-1">{profile?.marketingOptIn ? "Enabled" : "Disabled"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account Status</p>
              <p className="font-medium mt-1">Active</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm text-brand-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <div className="p-5">
                <p className="text-sm text-muted-foreground">No recent orders yet.</p>
              </div>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-mono font-semibold text-sm">{getOrderNumber(order)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatOrderDate(order.created_at)} · {getOrderItemCount(order)} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META]?.className ?? "bg-gray-100 text-gray-600"}`}>
                    {ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META]?.label ?? order.status}
                  </span>
                  <span className="font-bold">৳{Number(order.total_price ?? 0).toLocaleString("en-BD")}</span>
                  <Link href={`/api/invoice/${order.id}`} className="text-xs text-brand-600 hover:underline">
                    Invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
