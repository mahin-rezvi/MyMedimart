import Link from "next/link";
import ProductCard from "@/components/products/product-card";

const TRENDING = [
  { id: "t1", name: "Xiaomi Redmi Note 13 Pro", slug: "redmi-note-13-pro", price: 32000, discountPrice: 27499, images: [], rating: 4.4, reviewCount: 512, stock: 20, brand: "Xiaomi" },
  { id: "t2", name: "Portable Mini USB Fan 2000mAh", slug: "usb-fan-2000mah", price: 950, discountPrice: 629, images: [], rating: 4.2, reviewCount: 89, stock: 50, brand: "Generic" },
  { id: "t3", name: "Smart LED Light Controller", slug: "smart-light-controller", price: 1800, discountPrice: 970, images: [], rating: 4.0, reviewCount: 34, stock: 30, brand: "Generic" },
  { id: "t4", name: "Ninja Air Fryer 5.5L", slug: "ninja-air-fryer-55l", price: 18000, discountPrice: 14500, images: [], rating: 4.6, reviewCount: 267, stock: 9, brand: "Ninja" },
  { id: "t5", name: "OnePlus Buds Pro 2", slug: "oneplus-buds-pro-2", price: 14000, discountPrice: 11200, images: [], rating: 4.5, reviewCount: 189, stock: 14, brand: "OnePlus" },
  { id: "t6", name: "Rechargeable Clip Fan", slug: "rechargeable-clip-fan", price: 1200, discountPrice: 875, images: [], rating: 4.1, reviewCount: 56, stock: 40, brand: "Generic" },
  { id: "t7", name: "Vitamin D3 + K2 Supplement", slug: "vitamin-d3-k2", price: 1200, discountPrice: 950, images: [], rating: 4.7, reviewCount: 145, stock: 60, brand: "HealthPlus" },
  { id: "t8", name: "Yoga Mat Premium 6mm", slug: "yoga-mat-premium", price: 2500, discountPrice: 1800, images: [], rating: 4.3, reviewCount: 78, stock: 25, brand: "SportsFit" },
];

export default function TrendingProducts() {
  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Trending Now 🔥</h2>
          <p className="text-muted-foreground text-sm mt-1">Most popular products this week</p>
        </div>
        <Link href="/products?sort=trending" className="text-brand-600 hover:text-brand-700 text-sm font-semibold">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {TRENDING.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
