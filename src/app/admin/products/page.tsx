"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, Package, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 50;

interface Product {
  id: string; name: string; sku: string; price: number;
  discountPrice?: number; stock: number; category: string;
  isActive: boolean; isFeatured: boolean; isFlashSale?: boolean; images?: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search input (500ms)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [categoryFilter, statusFilter]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotal(data.total ?? data.products?.length ?? 0);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryFilter, statusFilter, page]);

  useEffect(() => { void fetchProducts(); }, [fetchProducts]);

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setTotal((t) => t - 1);
        toast.success("Product deleted");
      } else toast.error("Delete failed");
    } catch { toast.error("Network error"); }
  };

  const toggleActive = async (product: Product) => {
    const newValue = !product.isActive;
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, isActive: newValue } : p));
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isActive: newValue }),
      });
      if (!res.ok) {
        setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, isActive: !newValue } : p));
        toast.error("Update failed");
      }
    } catch {
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, isActive: !newValue } : p));
      toast.error("Network error");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total > 0 ? `${total} total products` : "No products found"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void fetchProducts()} className="btn-ghost p-2 rounded-lg" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 h-10 px-4 text-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU… (server-side)"
            className="form-input pl-9 h-9 text-sm w-full"
          />
          {debouncedSearch !== search && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input h-9 text-sm w-36"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{total === 0 ? "No products yet. Add your first product!" : "No products match your search."}</p>
            {total === 0 && (
              <Link href="/admin/products/new" className="btn-primary inline-flex items-center gap-2 mt-4">
                <Plus className="w-4 h-4" /> Add First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">SKU</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Stock</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Featured</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{product.sku || "—"}</td>
                    <td className="py-3 px-4 text-right">
                      <p className="font-semibold">{formatPrice(product.discountPrice ?? product.price)}</p>
                      {product.discountPrice && <p className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</p>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${(product.stock ?? 0) <= 5 ? "text-red-600" : (product.stock ?? 0) <= 10 ? "text-amber-600" : "text-green-600"}`}>
                        {product.stock ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => void toggleActive(product)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors ${product.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.isFeatured ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400" : "bg-muted text-muted-foreground"}`}>
                        {product.isFeatured ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/products/${product.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </Link>
                        <Link href={`/admin/products/${product.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-50 hover:text-brand-600 transition-colors" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => void deleteProduct(product.id, product.name)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
            <p className="text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
