"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";
import {
  ShoppingCart, Package, Users, TrendingUp, ArrowUpRight,
  Eye, Zap, Clock, BarChart2,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface Stats { products: number; orders: number; users: number; revenue: number }
interface Order {
  id: string; orderNumber: string;
  customer: { name: string }; total: number; totalAmount: number;
  status: string; createdAt: { seconds: number };
}

const CATEGORY_DATA = [
  { name: "Electronics", value: 35, color: "#0ea5e9" },
  { name: "Health", value: 28, color: "#8b5cf6" },
  { name: "Fashion", value: 18, color: "#ec4899" },
  { name: "Grocery", value: 12, color: "#22c55e" },
  { name: "Others", value: 7, color: "#f97316" },
];

const REVENUE_DATA = [
  { day: "Mon", revenue: 42000 }, { day: "Tue", revenue: 65000 }, { day: "Wed", revenue: 58000 },
  { day: "Thu", revenue: 91000 }, { day: "Fri", revenue: 78000 }, { day: "Sat", revenue: 115000 },
  { day: "Sun", revenue: 98000 },
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Pending",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  CONFIRMED:  { label: "Confirmed",  className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  PROCESSING: { label: "Processing", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  SHIPPED:    { label: "Shipped",    className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  DELIVERED:  { label: "Delivered",  className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED:  { label: "Cancelled",  className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const QUICK_ACTIONS = [
  { label: "Add Product", href: "/admin/products/new", icon: Package, gradient: "from-brand-500 to-cyan-500" },
  { label: "View Orders", href: "/admin/orders", icon: ShoppingCart, gradient: "from-purple-500 to-pink-500" },
  { label: "Manage Users", href: "/admin/users", icon: Users, gradient: "from-amber-500 to-orange-500" },
  { label: "Flash Sale", href: "/admin/products?flashSale=true", icon: Zap, gradient: "from-red-500 to-rose-500" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!FIREBASE_CONFIGURED || !db) {
        setLoading(false);
        return;
      }
      const firestore = db;
      try {
        const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
          getDocs(collection(firestore, "products")),
          getDocs(query(collection(firestore, "orders"), orderBy("createdAt", "desc"), limit(50))),
          getDocs(collection(firestore, "users")),
        ]);
        const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        const revenue = orders.reduce((s, o) => s + (o.total || o.totalAmount || 0), 0);
        setStats({ products: productsSnap.size, orders: ordersSnap.size, users: usersSnap.size, revenue });
        setRecentOrders(orders.slice(0, 6));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchStats();
  }, []);

  const STAT_CARDS = [
    {
      label: "Total Revenue", value: formatPrice(stats.revenue), icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20",
      change: "+12.5%", period: "vs last month",
    },
    {
      label: "Total Orders", value: stats.orders.toLocaleString(), icon: ShoppingCart,
      gradient: "from-brand-500 to-cyan-500", shadow: "shadow-brand-500/20",
      change: "+8.2%", period: "vs last week",
    },
    {
      label: "Products Listed", value: stats.products.toLocaleString(), icon: Package,
      gradient: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/20",
      change: "+24 new", period: "this month",
    },
    {
      label: "Customers", value: stats.users.toLocaleString(), icon: Users,
      gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20",
      change: "+340", period: "this month",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Greeting banner ── */}
      <div className="relative bg-gradient-to-r from-[#0c1a2e] via-[#1e3a5f] to-[#0284c7] rounded-3xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="absolute right-6 top-0 bottom-0 hidden lg:flex items-center opacity-10">
          <BarChart2 className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium mb-1">Good day, Admin 👋</p>
          <h1 className="font-display text-2xl font-black text-white mb-1">Dashboard Overview</h1>
          <p className="text-white/50 text-sm">Real-time data from your Firestore database</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
        {STAT_CARDS.map((stat) => (
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
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  {stat.change}
                </span>
              </div>
              <p className="font-display text-2xl font-black mb-1">
                {loading ? <span className="opacity-40">…</span> : stat.value}
              </p>
              <p className="text-white/70 text-xs">{stat.label}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{stat.period}</p>
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
              <p className="text-xs text-muted-foreground mt-0.5">Sample trend data</p>
            </div>
            <span className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +18.5%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA}>
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
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-1">Sales by Category</h2>
          <p className="text-xs text-muted-foreground mb-4">Distribution overview</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                {CATEGORY_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ borderRadius: "10px", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {CATEGORY_DATA.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 w-16 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cat.value}%`, background: cat.color }} />
                  </div>
                  <span className="font-semibold w-8 text-right">{cat.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Orders table ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-semibold text-sm">Recent Orders</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest transactions from Firestore</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-14">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Orders from customers will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentOrders.map((order) => {
              const status = STATUS_MAP[order.status] ?? { label: order.status, className: "bg-gray-100 text-gray-700" };
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{order.customer?.name ?? "Guest"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{order.orderNumber ?? order.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="text-sm font-bold">{formatPrice(order.total || order.totalAmount || 0)}</span>
                    <Link href={`/admin/orders`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
