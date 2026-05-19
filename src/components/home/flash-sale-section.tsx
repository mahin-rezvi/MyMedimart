"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/products/product-card";
import { Zap } from "lucide-react";

interface Product {
  id: string; name: string; slug?: string; price: number;
  discountPrice?: number; images?: string[]; rating?: number;
  reviewCount?: number; stock: number; brand?: string; category?: string;
}

function Countdown({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, endsAt.getTime() - Date.now());
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1.5 text-white">
      <span className="text-xs text-white/70">Ends in:</span>
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-white/20 font-mono font-bold text-sm w-9 h-8 rounded-lg flex items-center justify-center">{String(val).padStart(2, "0")}</span>
          {i < 2 && <span className="font-bold text-white/70">:</span>}
        </span>
      ))}
    </div>
  );
}

export default function FlashSaleSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [endsAt] = useState(() => new Date(Date.now() + 8 * 3600000));

  useEffect(() => {
    fetch("/api/products?flashSale=true&limit=6")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">Flash Sale</h2>
            <p className="text-white/70 text-xs">Limited time — limited stock!</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {endsAt && <Countdown endsAt={endsAt} />}
          <Link href="/products?flashSale=true" className="hidden sm:inline-flex bg-white text-red-600 font-bold text-sm px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">View All</Link>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {products.map((product) => <ProductCard key={product.id} product={product} isFlashSale />)}
        </div>
      )}
    </section>
  );
}
