"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Upload, Settings,
  Tag, Image as ImageIcon, Ticket, Menu, X, ChevronRight, Zap,
  LogOut, Bell, Search, ExternalLink, Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Resources", href: "/admin/resources", icon: Database },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/users", icon: Users },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Import / Export", href: "/admin/import", icon: Upload },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/admin-login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c1a2e] text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.07]">
        <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 shrink-0">
          <Zap className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-black text-sm tracking-tight">MediMart</p>
          <p className="text-[10px] text-white/40 font-medium">Admin Console</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden">
            <X className="w-4 h-4 text-white/60" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 h-9">
          <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <span className="text-xs text-white/30">Quick search…</span>
          <kbd className="ml-auto text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-white/30">⌘K</kbd>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-2 mt-2">Navigation</p>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : "text-white/55 hover:text-white hover:bg-white/[0.06]"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", active ? "text-brand-400" : "text-white/40 group-hover:text-white/70")} />
              <span className="flex-1">{item.label}</span>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/[0.07]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.displayName?.[0] ?? user?.email?.[0] ?? "A"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.displayName ?? "Admin"}</p>
            <p className="text-white/35 text-[10px] truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={handleAdminLogout}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
        <Link href="/" target="_blank" className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-white/25 hover:text-white/50 transition-colors">
          <ExternalLink className="w-3 h-3" /> View storefront
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = NAV_ITEMS.find((n) => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href)));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0f1a] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 shrink-0">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4 shrink-0 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="font-semibold text-foreground">{currentPage?.label ?? "Dashboard"}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <Bell className="w-4.5 h-4.5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <Link
              href="/admin/products/new"
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <Package className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
