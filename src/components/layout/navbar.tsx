"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ShoppingCart, Search, Menu, X, Heart, ChevronDown,
  Sun, Moon, Phone, Truck, Shield, RotateCcw, Zap,
  Smartphone, Laptop, Shirt, Home, Pill, ShoppingBag,
  Cpu, Dumbbell, Baby, BookOpen, Utensils, Car, LogOut, User, Package,
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", icon: Smartphone, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { name: "Computers", slug: "computers", icon: Laptop, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { name: "Fashion", slug: "fashion", icon: Shirt, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30" },
  { name: "Home & Living", slug: "home", icon: Home, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { name: "Health", slug: "health", icon: Pill, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { name: "Groceries", slug: "grocery", icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { name: "Components", slug: "components", icon: Cpu, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  { name: "Sports", slug: "sports", icon: Dumbbell, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
  { name: "Baby & Toys", slug: "baby", icon: Baby, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { name: "Kitchen", slug: "kitchen", icon: Utensils, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  { name: "Books", slug: "books", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  { name: "Automotive", slug: "automotive", icon: Car, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-950/30" },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Flash Sale", href: "/flash-sale", badge: "🔥" },
  { label: "Shop", href: "/products" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => setMounted(true));
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [userMenuOpen]);

  useEffect(() => {
    let ignore = false;

    async function loadCartCount() {
      if (!user) {
        setCartCount(0);
        return;
      }

      try {
        const res = await fetch("/api/cart");
        if (!res.ok) throw new Error("Cart unavailable");
        const data = await res.json();
        if (!ignore) setCartCount(Number(data.cart?.item_count ?? 0));
      } catch {
        if (!ignore) setCartCount(0);
      }
    }

    loadCartCount();
    window.addEventListener("medimart:cart-updated", loadCartCount);
    return () => {
      ignore = true;
      window.removeEventListener("medimart:cart-updated", loadCartCount);
    };
  }, [user]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }, [searchQuery, router]);

  const avatar = user?.photoURL ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-200" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm ring-2 ring-brand-200">
      {user?.displayName?.[0] ?? user?.email?.[0] ?? <User className="w-4 h-4" />}
    </div>
  );

  return (
    <>
      {/* ── Top announcement bar ── */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-700 text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3 h-3" /> 01781-452943
            </span>
            <span className="flex items-center gap-1.5 opacity-80">
              <Truck className="w-3 h-3" /> Free delivery on orders over ৳1000
            </span>
          </div>
          <div className="flex items-center gap-6 opacity-80">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> 100% Authentic</span>
            <span className="flex items-center gap-1.5"><RotateCcw className="w-3 h-3" /> 7-day Returns</span>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-100 dark:border-gray-800"
            : "bg-white dark:bg-gray-950 border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-2">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/30">
                <span className="text-white font-display font-black text-sm">M</span>
              </div>
              <span className="font-display font-black text-xl tracking-tight hidden sm:block">
                <span className="text-brand-600">Medi</span>
                <span className="text-foreground">Mart</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-xl font-medium transition-all",
                    pathname === link.href
                      ? "bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400"
                      : "text-foreground/70 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {link.badge && <span className="text-xs">{link.badge}</span>}
                  {link.label}
                </Link>
              ))}

              {/* Categories mega menu */}
              <div
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button className={cn(
                  "flex items-center gap-1 px-3.5 py-2 text-sm rounded-xl font-medium transition-all",
                  megaMenuOpen
                    ? "bg-brand-50 dark:bg-brand-950/50 text-brand-600"
                    : "text-foreground/70 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                )}>
                  Categories
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", megaMenuOpen && "rotate-180")} />
                </button>

                {megaMenuOpen && (
                  <div className="absolute top-full left-0 w-[620px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-4 grid grid-cols-3 gap-1 mt-1 animate-fade-in">
                    <div className="col-span-3 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Browse all categories</p>
                    </div>
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", cat.bg)}>
                          <cat.icon className={cn("w-4 h-4", cat.color)} />
                        </div>
                        <span className="text-sm font-medium text-foreground/80 group-hover:text-brand-600 transition-colors">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:flex mx-2">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands…"
                  className="w-full h-10 pl-10 pr-16 bg-gray-100 dark:bg-gray-800 text-sm rounded-xl border border-transparent focus:border-brand-300 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded hidden md:inline font-mono">
                  ⌘K
                </kbd>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Theme */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Wishlist */}
              <Link href="/account/wishlist" className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <Heart className="w-4 h-4" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-xl transition-all text-sm font-semibold shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30 hover:scale-105 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Flash Sale pill */}
              <Link href="/flash-sale" className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md shadow-red-500/20 hover:scale-105 transition-all">
                <Zap className="w-3.5 h-3.5 fill-white" />
                Flash
              </Link>

              {/* Auth */}
              {user ? (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    {avatar}
                    <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform hidden sm:block", userMenuOpen && "rotate-180")} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-1.5 animate-fade-in z-50">
                      <div className="px-3 py-2.5 mb-1 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold truncate">{user.displayName ?? "My Account"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <User className="w-4 h-4 text-muted-foreground" /> My Account
                      </Link>
                      <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Package className="w-4 h-4 text-muted-foreground" /> My Orders
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                        <button
                          onClick={() => { void signOut(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/sign-in" className="text-sm font-medium text-foreground/80 hover:text-foreground px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hidden sm:flex">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-500/25 hover:scale-105 active:scale-95">
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 animate-slide-up">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full h-11 pl-10 bg-gray-100 dark:bg-gray-800 text-sm rounded-xl border-transparent focus:outline-none"
                  />
                </div>
              </form>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                    pathname === link.href
                      ? "bg-brand-50 text-brand-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {link.badge} {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">Categories</p>
                <div className="grid grid-cols-3 gap-1">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-center"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cat.bg)}>
                        <cat.icon className={cn("w-5 h-5", cat.color)} />
                      </div>
                      <span className="text-[10px] font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
