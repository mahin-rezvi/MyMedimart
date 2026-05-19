"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, ChevronRight, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

// Mock data — replace with DB fetch
const PRODUCT = {
  id: "1",
  name: "Samsung Galaxy S24 Ultra",
  slug: "samsung-galaxy-s24-ultra",
  sku: "SAM-S24U-256",
  price: 145000,
  discountPrice: 129999,
  stock: 10,
  images: [] as string[],
  rating: 4.8,
  reviewCount: 432,
  brand: { name: "Samsung", slug: "samsung" },
  category: { name: "Electronics", slug: "electronics" },
  description: "The Samsung Galaxy S24 Ultra is the most advanced smartphone ever made by Samsung. Featuring a built-in S Pen, 200MP camera, and the latest Snapdragon 8 Gen 3 processor.",
  specs: {
    "Display": "6.8\" Dynamic AMOLED 2X, 120Hz",
    "Processor": "Snapdragon 8 Gen 3",
    "RAM": "12GB",
    "Storage": "256GB / 512GB",
    "Camera": "200MP + 50MP + 12MP + 10MP",
    "Battery": "5000mAh, 45W Fast Charging",
    "OS": "Android 14, One UI 6.1",
    "Colors": "Titanium Black, Gray, Violet, Yellow",
  },
  variants: [
    { id: "v1", name: "Storage", value: "256GB", priceAdjust: 0, stock: 5 },
    { id: "v2", name: "Storage", value: "512GB", priceAdjust: 10000, stock: 5 },
  ],
};

const REVIEWS = [
  { id: "r1", user: "Rahim Ahmed", rating: 5, comment: "Excellent phone! Camera is amazing.", date: "2024-12-15", verified: true },
  { id: "r2", user: "Fatima Khatun", rating: 4, comment: "Great device but expensive. S Pen is very useful.", date: "2024-12-10", verified: true },
];

export default function ProductDetailPage() {
  const [selectedVariant, setSelectedVariant] = useState(PRODUCT.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const finalPrice = (PRODUCT.discountPrice ?? PRODUCT.price) + selectedVariant.priceAdjust;
  const discount = Math.round(((PRODUCT.price - PRODUCT.discountPrice) / PRODUCT.price) * 100);

  const addToCart = () => {
    toast.success(`${PRODUCT.name} (${selectedVariant.value}) added to cart!`);
  };

  const buyNow = () => {
    toast.success("Redirecting to checkout…");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/category/${PRODUCT.category.slug}`} className="hover:text-brand-600">{PRODUCT.category.name}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">{PRODUCT.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
            {PRODUCT.images[activeImg] ? (
              <Image src={PRODUCT.images[activeImg]} alt={PRODUCT.name} width={600} height={600} className="object-contain" />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-muted to-muted/50">
                <span className="text-8xl opacity-20">📱</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {(PRODUCT.images.length > 0 ? PRODUCT.images : [null, null, null, null]).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-muted ${activeImg === i ? "border-brand-600" : "border-border"}`}
              >
                {img ? (
                  <Image src={img} alt="" width={64} height={64} className="object-contain w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl opacity-20">📱</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/brand/${PRODUCT.brand.slug}`} className="text-brand-600 text-sm font-semibold hover:underline">
                {PRODUCT.brand.name}
              </Link>
              <span className="text-muted-foreground text-xs">SKU: {PRODUCT.sku}</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {PRODUCT.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(PRODUCT.rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
              ))}
            </div>
            <span className="text-sm font-semibold">{PRODUCT.rating}</span>
            <span className="text-sm text-muted-foreground">({PRODUCT.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="font-display text-4xl font-bold text-brand-700 dark:text-brand-400">
              {formatPrice(finalPrice)}
            </span>
            <span className="text-muted-foreground line-through text-lg">{formatPrice(PRODUCT.price)}</span>
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold px-2 py-1 rounded-lg">
              -{discount}% OFF
            </span>
          </div>

          {/* Variants */}
          <div>
            <p className="text-sm font-semibold mb-2">Storage</p>
            <div className="flex gap-2">
              {PRODUCT.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedVariant.id === v.id
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-950/50 text-brand-700"
                      : "border-border hover:border-brand-400"
                  }`}
                >
                  {v.value}
                  {v.priceAdjust > 0 && <span className="text-xs ml-1 text-muted-foreground">+{formatPrice(v.priceAdjust)}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold">Quantity:</p>
            <div className="flex items-center gap-2 border border-border rounded-xl p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(PRODUCT.stock, quantity + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">{PRODUCT.stock} in stock</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={addToCart} className="flex-1 btn-outline flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
            <button onClick={buyNow} className="flex-1 btn-primary flex items-center justify-center gap-2">
              Buy Now
            </button>
            <button className="w-11 h-11 border-2 border-border rounded-xl flex items-center justify-center hover:border-red-400 hover:bg-red-50 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="w-11 h-11 border-2 border-border rounded-xl flex items-center justify-center hover:border-brand-400 hover:bg-brand-50 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-3 border-t border-border pt-5">
            {[
              { icon: Shield, label: "Official Warranty" },
              { icon: Truck, label: "Fast Delivery" },
              { icon: RotateCcw, label: "7-Day Returns" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-9 h-9 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description / Specs / Reviews */}
      <div className="mt-12 border-t border-border pt-8">
        <div className="flex border-b border-border mb-6 gap-6">
          {["Description", "Specifications", `Reviews (${PRODUCT.reviewCount})`].map((tab, i) => (
            <button key={tab} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${i === 0 ? "border-brand-600 text-brand-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{PRODUCT.description}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Specifications</h3>
            <div className="space-y-2">
              {Object.entries(PRODUCT.specs).map(([key, val]) => (
                <div key={key} className="flex gap-3 text-sm border-b border-border pb-2">
                  <span className="text-muted-foreground w-28 shrink-0">{key}</span>
                  <span className="font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10">
          <h3 className="font-semibold mb-4">Customer Reviews</h3>
          <div className="space-y-4">
            {REVIEWS.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 font-bold text-sm">
                      {review.user[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{review.user}</p>
                      {review.verified && <span className="text-xs text-green-600">✓ Verified Purchase</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex mb-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
