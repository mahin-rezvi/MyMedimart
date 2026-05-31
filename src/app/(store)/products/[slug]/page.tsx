"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Star, ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw,
  ChevronRight, Minus, Plus, Package, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number | null;
  discount_price?: number | null;
  stock: number;
  images: string[];
  brand?: string;
  category?: string;
  category_id?: string;
  description?: string;
  short_desc?: string;
  shortDesc?: string;
  specs?: Record<string, string>;
  tags?: string[];
  is_active?: boolean;
  is_featured?: boolean;
  is_flash_sale?: boolean;
}

const TABS = ["Description", "Specifications"] as const;

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Description");
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const effectivePrice = Number(product?.discountPrice ?? product?.discount_price ?? product?.price ?? 0);
  const originalPrice = Number(product?.price ?? 0);
  const hasDiscount = effectivePrice > 0 && effectivePrice < originalPrice;
  const discountPct = hasDiscount ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0;
  const images = product?.images ?? [];
  const specs = product?.specs ?? {};
  const description = product?.description ?? product?.short_desc ?? product?.shortDesc ?? "";

  const addToCart = async (): Promise<boolean> => {
    if (!product) return false;
    if (!user) {
      toast.error("Sign in to save your cart");
      router.push(`/sign-in?redirect_url=/products/${slug}`);
      return false;
    }
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          price: effectivePrice,
          quantity,
          imageUrl: images[0] ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to add item");
      window.dispatchEvent(new Event("medimart:cart-updated"));
      toast.success(`${product.name} added to cart!`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Add to cart failed");
      return false;
    }
  };

  const buyNow = () => {
    addToCart().then((added) => { if (added) router.push("/checkout"); });
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        <p className="text-muted-foreground text-sm">Loading product…</p>
      </div>
    );
  }

  // ── Not found state ──
  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground">This product doesn&apos;t exist or has been removed.</p>
        <Link href="/products" className="btn-primary px-6 py-2 mt-2">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.category && (
          <>
            <Link href={`/category/${product.category_id ?? product.category.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-brand-600">
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ── Image Gallery ── */}
        <div className="space-y-3">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
            {images[activeImg] ? (
              <Image
                src={images[activeImg]}
                alt={product.name}
                width={600}
                height={600}
                className="object-contain w-full h-full"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-muted to-muted/50 gap-3">
                <Package className="w-16 h-16 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">No image</p>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-muted transition-all ${
                    activeImg === i ? "border-brand-600 shadow-md" : "border-border hover:border-brand-300"
                  }`}
                >
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Details ── */}
        <div className="space-y-5">
          {/* Brand + SKU */}
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {product.brand && (
                <span className="text-brand-600 text-sm font-semibold bg-brand-50 dark:bg-brand-950/30 px-2.5 py-1 rounded-full">
                  {product.brand}
                </span>
              )}
              {product.sku && (
                <span className="text-muted-foreground text-xs font-mono">SKU: {product.sku}</span>
              )}
              {product.is_flash_sale && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">⚡ Flash Sale</span>
              )}
              {product.is_featured && (
                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">★ Featured</span>
              )}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>
            {description && (
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed line-clamp-2">{description}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 flex-wrap">
            <span className="font-display text-4xl font-bold text-brand-700 dark:text-brand-400">
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-muted-foreground line-through text-lg">{formatPrice(originalPrice)}</span>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold px-2 py-1 rounded-lg">
                  -{discountPct}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"}`} />
            <span className={`text-sm font-medium ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-amber-600" : "text-red-600"}`}>
              {product.stock > 10 ? `${product.stock} in stock` : product.stock > 0 ? `Only ${product.stock} left!` : "Out of stock"}
            </span>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold">Quantity:</p>
            <div className="flex items-center gap-2 border border-border rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg disabled:opacity-40 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg disabled:opacity-40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-outline flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
            <button
              onClick={buyNow}
              disabled={product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Buy Now
            </button>
            <button
              onClick={() => setWishlisted((w) => !w)}
              className={`w-11 h-11 border-2 rounded-xl flex items-center justify-center transition-colors ${
                wishlisted ? "border-red-500 bg-red-50 text-red-500" : "border-border hover:border-red-400 hover:bg-red-50 hover:text-red-500"
              }`}
              title="Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
              className="w-11 h-11 border-2 border-border rounded-xl flex items-center justify-center hover:border-brand-400 hover:bg-brand-50 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Trust badges */}
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

      {/* ── Tabs: Description / Specs ── */}
      {(description || Object.keys(specs).length > 0) && (
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex border-b border-border mb-6 gap-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Description" && (
            <div className="max-w-3xl">
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {description || "No description available."}
              </p>
            </div>
          )}

          {activeTab === "Specifications" && (
            <div className="max-w-2xl">
              {Object.keys(specs).length > 0 ? (
                <div className="divide-y divide-border">
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex gap-4 py-3 text-sm">
                      <span className="text-muted-foreground w-36 shrink-0 font-medium">{key}</span>
                      <span className="font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No specifications available.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Related Products placeholder ── */}
      <div className="mt-12 border-t border-border pt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">More Products</h2>
          <Link href="/products" className="text-sm font-semibold text-brand-600 hover:underline">View All →</Link>
        </div>
        <p className="text-sm text-muted-foreground">
          <Link href="/products" className="hover:text-brand-600 hover:underline">Browse all available products</Link>
        </p>
      </div>
    </div>
  );
}
