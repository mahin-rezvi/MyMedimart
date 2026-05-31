"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

interface CartItem {
  id: string;
  product_id?: string | null;
  name: string;
  variant?: string | null;
  price: number;
  quantity: number;
  image_url?: string | null;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  item_count: number;
}

const EMPTY_CART: Cart = { items: [], subtotal: 0, item_count: 0 };

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCart(EMPTY_CART);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load cart");
      setCart(data.cart ?? EMPTY_CART);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load cart");
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) void Promise.resolve().then(loadCart);
  }, [authLoading, loadCart]);

  const updateQty = async (item: CartItem, quantity: number) => {
    setUpdatingId(item.id);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update cart");
      setCart(data.cart ?? EMPTY_CART);
      window.dispatchEvent(new Event("medimart:cart-updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/cart?itemId=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove item");
      setCart(data.cart ?? EMPTY_CART);
      window.dispatchEvent(new Event("medimart:cart-updated"));
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Remove failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const subtotal = Number(cart.subtotal ?? 0);
  const shipping = subtotal >= 1000 || subtotal === 0 ? 0 : 80;
  const total = subtotal + shipping;

  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold">Sign in to view your cart</h1>
          <p className="text-muted-foreground mt-2">Each account has its own saved cart.</p>
          <Link href="/login?redirect=/cart" className="btn-primary inline-flex mt-6">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center gap-2 text-muted-foreground">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading your cart...
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-muted mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Start shopping to add items to your saved cart.</p>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
              <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                {item.variant && <p className="text-xs text-muted-foreground mt-0.5">{item.variant}</p>}
                <p className="font-bold text-brand-700 dark:text-brand-400 mt-1">{formatPrice(Number(item.price))}</p>
                <div className="flex items-center justify-between mt-3 gap-3">
                  <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                    <button
                      onClick={() => updateQty(item, item.quantity - 1)}
                      disabled={updatingId === item.id}
                      className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item, item.quantity + 1)}
                      disabled={updatingId === item.id}
                      className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatPrice(Number(item.price) * item.quantity)}</span>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1" disabled={updatingId === item.id}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-3">Have a coupon?</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon code"
                className="form-input h-10 text-sm flex-1"
              />
              <button className="btn-outline h-10 px-4 text-sm whitespace-nowrap" type="button">Apply</button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({cart.item_count} items)</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground bg-muted rounded-lg p-2">
                Add {formatPrice(1000 - subtotal)} more for FREE shipping.
              </p>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-brand-700 dark:text-brand-400">{formatPrice(total)}</span>
            </div>
          </div>

          <Link href="/checkout" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>

          <Link href="/products" className="text-center block mt-3 text-sm text-brand-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
