import React from "react";
import Link from "next/link";
import { ShoppingBag, Star, Shield, Truck, Zap } from "lucide-react";

const PERKS = [
  { icon: Shield, text: "100% secure payments" },
  { icon: Truck, text: "Free delivery on ৳1000+" },
  { icon: Star, text: "4.9★ rated by 1M+ buyers" },
  { icon: Zap, text: "Lightning-fast checkout" },
];



export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (brand/visual) ── */}
      <div className="hidden lg:flex lg:w-[54%] relative flex-col overflow-hidden">
        {/* Deep gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1a2e] via-[#0f3460] to-[#0369a1]" />

        {/* Glowing orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl bg-gradient-to-br from-cyan-400 to-blue-600 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-15 blur-3xl bg-gradient-to-tr from-brand-400 to-purple-600 translate-y-1/2 -translate-x-1/2" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        

        {/* Center content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-xl">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-black text-white tracking-tight">
              Medi<span className="text-brand-300">Mart</span>
            </span>
          </Link>

          {/* Headline */}
          <h2 className="font-display text-5xl font-black text-white leading-tight mb-4">
            Bangladesh&apos;s
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-cyan-300">
              #1 Marketplace
            </span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-sm mb-10">
            Shop from 50,000+ products with fast delivery, unbeatable prices, and 100% authentic products.
          </p>

          {/* Perks */}
          <div className="space-y-3">
            {PERKS.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-brand-300" />
                </div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["🧑", "👩", "👦", "👧", "🧔"].map((e, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 border-2 border-[#0f3460] flex items-center justify-center text-sm"
                >
                  {e}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Join 1M+ shoppers</p>
              <p className="text-white/40 text-xs">Trusted since 2020</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center bg-[#f8fafc] dark:bg-[#0d1117] px-4 py-12 relative overflow-hidden">
        {/* Subtle bg pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Mobile logo */}
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            Medi<span className="text-brand-600">Mart</span>
          </span>
        </Link>

        <div className="relative z-10 w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
}
