"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/products/product-card";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  stock: number;
  brand?: string;
}

const SAMPLE_PRODUCTS: Product[] = Array.from({ length: 16 }, (_, i) => ({
  id: `p${i}`,
  name: [
    "Samsung Galaxy A35",
    "Lenovo IdeaPad Gaming 3",
    "JBL Tune 760NC",
    "HP LaserJet Pro",
    "Realme Narzo 70",
    "ASUS VivoBook 16",
    "Mi Pad 6",
    "OnePlus 12",
  ][i % 8],
  slug: `product-${i}`,
  price: [32000, 85000, 15000, 28000, 22000, 72000, 45000, 95000][i % 8],
  discountPrice: [27000, 72000, 11000, 22000, 18000, 62000, 38000, 82000][i % 8],
  images: [],
  rating: 4 + (i % 10) * 0.1,
  reviewCount: 50 + i * 23,
  stock: 5 + i,
  brand: ["Samsung", "Lenovo", "JBL", "HP", "Realme", "ASUS", "Xiaomi", "OnePlus"][i % 8],
}));

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

const PRICE_RANGES = [
  { label: "Under ৳1,000", min: 0, max: 1000 },
  { label: "৳1,000 – ৳5,000", min: 1000, max: 5000 },
  { label: "৳5,000 – ৳20,000", min: 5000, max: 20000 },
  { label: "৳20,000 – ৳50,000", min: 20000, max: 50000 },
  { label: "৳50,000+", min: 50000, max: Infinity },
];

export default function ProductsClientPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => searchParams?.toString() ?? "", [searchParams]);

  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("limit", "24");
        const category = searchParams?.get("category");
        if (category) params.set("category", category);

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (ignore) return;
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load products");
        }

        setProducts((data.products && data.products.length > 0) ? data.products : SAMPLE_PRODUCTS);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to load products");
        setProducts(SAMPLE_PRODUCTS);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      ignore = true;
    };
  }, [queryString, searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-20 space-y-6">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3">Price Range</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => (
                  <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 accent-brand-600" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3].map((rating) => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 accent-brand-600" />
                    <span className="text-sm text-amber-500">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
                    <span className="text-xs text-muted-foreground">& up</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3">Brand</h3>
              <div className="space-y-2">
                {["Samsung", "Apple", "Sony", "HP", "ASUS", "Lenovo"].map((brand) => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 accent-brand-600" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{products.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="relative">
                <select className="form-input h-9 text-sm pr-8 appearance-none bg-card cursor-pointer">
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-10 gap-1">
            {[1, 2, 3, "...", 10].map((page, i) => (
              <button
                key={i}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === 1
                    ? "bg-brand-600 text-white"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
