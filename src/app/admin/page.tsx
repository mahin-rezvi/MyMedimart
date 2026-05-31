"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Package, Users, TrendingUp, ArrowUpRight,
  Eye, Zap, Clock, BarChart2, Mail, LogOut, RefreshCw,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { ORDER_STATUS_META } from "@/lib/order-status";

interface DashboardStats {
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  userCount: number;
  recentOrders: RecentOrder[];
  revenueByDay: { day: string; revenue: number }[];
  ordersByStatus: Record<string, number>;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: { name: string };
  total: number;
  status: string;
  createdAt: { seconds: number };
}

const CATEGORY_COLORS = ["#0ea5e9", "#8b5cf6", "#ec4899", "#22c55e", "#f97316"];

const QUICK_ACTIONS = [
  { label: "Add Product", href: "/admin/products/new", icon: Package, gradient: "from-brand-500 to-cyan-500" },
  { label: "View Orders", href: "/admin/orders", icon: ShoppingCart, gradient: "from-purple-500 to-pink-500" },
  { label: "Manage Users", href: "/admin/users", icon: Users, gradient: "from-amber-500 to-orange-500" },
  { label: "Flash Sale", href: "/admin/products?flashSale=true", icon: Zap, gradient: "from-red-500 to-rose-500" },
  { label: "Email Control", href: "/admin/email-control", icon: Mail, gradient: "from-orange-500 to-red-500" },
];

function StatCardSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-5 overflow-hidden shadow-xl animate-pulse">
      <div className="h-28" />
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to load dashboard");
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      if (silent) toast.error("Failed to refresh stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void fetchStats(); }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/admin-login");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Build order status pie data from real stats
  const statusPieData = stats
    ? Object.entries(stats.ordersByStatus).map(([status, count], i) => ({
        name: ORDER_STATUS_META[status as keyof typeof ORDER_STATUS_META]?.label ?? status,
        value: count,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
    : [];

  const STAT_CARDS = stats
    ? [
        {
          label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: TrendingUp,
          gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20",
        },
        {
          label: "Total Orders", value: stats.orderCount.toLocaleString(), icon: ShoppingCart,
          gradient: "from-brand-500 to-cyan-500", shadow: "shadow-brand-500/20",
        },
        {
          label: "Products Listed", value: stats.productCount.toLocaleString(), icon: Package,
          gradient: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/20",
        },
        {
          label: "Customers", value: stats.userCount.toLocaleString(), icon: Users,
          gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* ── Admin Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Logged in as {user?.email ?? "…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchStats(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* ── Greeting banner ── */}
      <div className="relative bg-gradient-to-r from-[#0c1a2e] via-[#1e3a5f] to-[#0284c7] rounded-3xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="absolute right-6 top-0 bottom-0 hidden lg:flex items-center opacity-10">
          <BarChart2 className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium mb-1">
            {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}, {user?.displayName?.split(" ")[0] ?? "Admin"} 👋
          </p>
          <h1 className="font-display text-2xl font-black text-white mb-1">Dashboard Overview</h1>
          <p className="text-white/50 text-sm">Real-time data from your Neon database</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-foreground">{action.label}</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : STAT_CARDS.map((stat) => (
            <div
              key={stat.label}
              className={`relative bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 text-white overflow-hidden shadow-xl ${stat.shadow}`}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="font-display text-2xl font-black mb-1">{stat.value}</p>
                <p className="text-white/70 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-sm">Weekly Revenue</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats?.revenueByDay.length ? "Last 7 days from database" : "No data for last 7 days"}
              </p>
            </div>
          </div>
          {loading ? (
            <div className="h-[200px] bg-muted animate-pulse rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats?.revenueByDay ?? []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatPrice(v as number), "Revenue"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status pie chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-1">Orders by Status</h2>
          <p className="text-xs text-muted-foreground mb-4">Current distribution</p>
          {loading ? (
            <div className="h-[140px] bg-muted animate-pulse rounded-xl" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                    {statusPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: "10px", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusPieData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="font-semibold">{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Recent Orders table ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-semibold text-sm">Recent Orders</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest transactions from Neon</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : !stats?.recentOrders.length ? (
          <div className="text-center py-14">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Orders from customers will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {stats.recentOrders.map((order) => {
              const meta = ORDER_STATUS_META[order.status as keyof typeof ORDER_STATUS_META];
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{order.customer?.name ?? "Guest"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{order.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${meta?.className ?? "bg-gray-100 text-gray-700"}`}>
                      {meta?.label ?? order.status}
                    </span>
                    <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                    <Link href={`/admin/orders/${order.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="View order">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
