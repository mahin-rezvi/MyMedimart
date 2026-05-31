"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  discountPrice?: number | null;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  stock: number;
  category?: string;
  brand?: string;
}

interface ProductCardProps {
  product: Product;
  isFlashSale?: boolean;
}

export default function ProductCard({ product, isFlashSale }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const discount = product.discountPrice
    ? calculateDiscount(product.price, product.discountPrice)
    : 0;
  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const productUrl = `/products/${product.slug ?? product.id}`;
  const productImages = product.images ?? [];
  const productRating = product.rating ?? 0;
  const productReviews = product.reviewCount ?? 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Sign in to save your cart");
      router.push(`/login?redirect=${encodeURIComponent(productUrl)}`);
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          price: displayPrice,
          quantity: 1,
          imageUrl: productImages[0] ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add item");
      }

      window.dispatchEvent(new Event("medimart:cart-updated"));
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Add to cart failed");
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success("Added to wishlist!");
  };

  return (
    <Link href={productUrl} className="product-card group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-muted aspect-square">
        {productImages[0] ? (
          <Image
            src={productImages[0]}
            alt={product.name}
            fill
            className="product-card-img"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-4xl opacity-30">🛍️</span>
          </div>
        )}

        {/* Badges */}
        {isFlashSale ? (
          <span className="flash-badge">⚡ Flash</span>
        ) : hasDiscount ? (
          <span className="discount-badge">-{discount}%</span>
        ) : null}

        {/* Low Stock */}
        {(product.stock ?? 0) <= 5 && (product.stock ?? 0) > 0 && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
            Only {product.stock} left!
          </span>
        )}

        {/* Hover Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className="w-8 h-8 bg-white dark:bg-card shadow-md rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-8 h-8 bg-white dark:bg-card shadow-md rounded-lg flex items-center justify-center hover:bg-brand-50 hover:text-brand-600 transition-colors"
            aria-label="Quick view"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        {product.brand && (
          <span className="text-xs text-muted-foreground font-medium">{product.brand}</span>
        )}
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-3 h-3",
                  star <= Math.round(productRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({productReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={cn("font-bold text-sm", isFlashSale ? "text-red-600" : "text-brand-700 dark:text-brand-400")}>
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={(product.stock ?? 0) === 0}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
            (product.stock ?? 0) === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-brand-600 hover:bg-brand-700 text-white active:scale-95"
          )}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {(product.stock ?? 0) === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
