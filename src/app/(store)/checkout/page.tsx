"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Smartphone, Banknote, ArrowRight, Lock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

const ORDER_SUMMARY = [
  { name: "Samsung Galaxy S24 Ultra", variant: "256GB", price: 129999, qty: 1 },
  { name: "JBL Flip 6 Speaker", variant: null, price: 8999, qty: 2 },
];

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive" },
  { id: "bkash", label: "bKash", icon: Smartphone, desc: "Pay via bKash mobile banking" },
  { id: "nagad", label: "Nagad", icon: Smartphone, desc: "Pay via Nagad" },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, desc: "Visa, Mastercard, etc." },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", street: "",
    area: "", city: "", notes: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to place an order");
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const subtotal = ORDER_SUMMARY.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = 80;
  const total = subtotal + shipping;

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.error("You must be signed in to place an order");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          ...form,
          paymentMethod,
          items: ORDER_SUMMARY,
          subtotal,
          shippingCost: shipping,
          totalAmount: total,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Order placed successfully!");
        router.push(`/order-confirmed/${data.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Order failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name *</label>
                <input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="form-input" placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone *</label>
                <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="form-input" placeholder="01XXXXXXXXX" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="form-input" placeholder="email@example.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">Street Address *</label>
                <input required value={form.street} onChange={(e) => update("street", e.target.value)} className="form-input" placeholder="House/Flat no, Road, Block" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Area/Thana *</label>
                <input required value={form.area} onChange={(e) => update("area", e.target.value)} className="form-input" placeholder="Mirpur, Gulshan..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">City *</label>
                <select required value={form.city} onChange={(e) => update("city", e.target.value)} className="form-input">
                  <option value="">Select City</option>
                  {["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">Order Notes</label>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className="form-input resize-none" placeholder="Special instructions..." />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-600" />
              Payment Method
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === pm.id
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30"
                      : "border-border hover:border-brand-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.id}
                    checked={paymentMethod === pm.id}
                    onChange={() => setPaymentMethod(pm.id)}
                    className="accent-brand-600"
                  />
                  <pm.icon className={`w-5 h-5 ${paymentMethod === pm.id ? "text-brand-600" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-semibold text-sm">{pm.label}</p>
                    <p className="text-xs text-muted-foreground">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {ORDER_SUMMARY.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                  {item.name} {item.variant && `(${item.variant})`} ×{item.qty}
                </span>
                <span className="font-medium shrink-0">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-brand-700 dark:text-brand-400">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Place Order {formatPrice(total)}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secure & encrypted checkout
          </p>
        </div>
      </form>
    </div>
  );
}
