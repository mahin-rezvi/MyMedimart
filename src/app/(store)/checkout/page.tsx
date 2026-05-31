"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Smartphone, Banknote, ArrowRight, Lock, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

interface CartItem {
  id: string;
  name: string;
  variant?: string | null;
  price: number;
  quantity: number;
}

interface Address {
  id: string;
  label?: string | null;
  full_name?: string | null;
  phone?: string | null;
  street?: string | null;
  area?: string | null;
  city?: string | null;
  postal_code?: string | null;
  notes?: string | null;
  is_default: boolean;
}

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", street: "",
    area: "", city: "", notes: "",
  });

  const applyAddress = (address: Address) => {
    setForm((prev) => ({
      ...prev,
      fullName: address.full_name || prev.fullName,
      phone: address.phone || prev.phone,
      street: address.street || "",
      area: address.area || "",
      city: address.city || "",
      notes: address.notes || prev.notes,
    }));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to place an order");
      router.push("/sign-in?redirect_url=/checkout");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    const currentUser = user;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || currentUser.displayName || "",
      email: prev.email || currentUser.email || "",
      phone: prev.phone || currentUser.phoneNumber || "",
    }));

    async function loadCheckoutData() {
      setInitialLoading(true);
      try {
        const [cartRes, settingsRes, addressesRes] = await Promise.all([
          fetch("/api/cart"),
          fetch("/api/account/settings"),
          fetch("/api/account/addresses"),
        ]);

        const cartData = await cartRes.json();
        if (!cartRes.ok) throw new Error(cartData.error ?? "Failed to load cart");
        setItems(cartData.cart?.items ?? []);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          const settings = data.settings;
          setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || settings?.display_name || currentUser.displayName || "",
            phone: prev.phone || settings?.phone || currentUser.phoneNumber || "",
            street: prev.street || settings?.default_address || "",
            city: prev.city || settings?.city || "",
          }));
        }

        if (addressesRes.ok) {
          const data = await addressesRes.json();
          const loadedAddresses: Address[] = data.addresses ?? [];
          setAddresses(loadedAddresses);
          const defaultAddress = loadedAddresses.find((address) => address.is_default) ?? loadedAddresses[0];
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            applyAddress(defaultAddress);
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Checkout unavailable");
      } finally {
        setInitialLoading(false);
      }
    }

    loadCheckoutData();
  }, [authLoading, user]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [items]
  );
  const shipping = subtotal >= 1000 || subtotal === 0 ? 0 : 80;
  const total = subtotal + shipping;

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const selectAddress = (id: string) => {
    setSelectedAddressId(id);
    const address = addresses.find((item) => item.id === id);
    if (address) applyAddress(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.error("You must be signed in to place an order");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          items: items.map((item) => ({
            name: item.name,
            variant: item.variant,
            price: Number(item.price),
            qty: item.quantity,
          })),
          subtotal,
          shippingCost: shipping,
          totalAmount: total,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed. Please try again.");

      window.dispatchEvent(new Event("medimart:cart-updated"));
      toast.success("Order placed successfully");
      router.push(`/order-confirmed/${data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || initialLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center gap-2 text-muted-foreground">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading checkout...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Add products before checking out.</p>
        <button onClick={() => router.push("/products")} className="btn-primary mt-6">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              Shipping Address
            </h2>

            {addresses.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-medium mb-1 block">Saved Address</label>
                <select value={selectedAddressId} onChange={(e) => selectAddress(e.target.value)} className="form-input">
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label || "Address"}{address.is_default ? " (Default)" : ""} - {address.city || "No city"}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                <label className="text-sm font-medium mb-1 block">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="form-input" placeholder="email@example.com" />
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
                  {["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"].map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">Order Notes</label>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className="form-input resize-none" placeholder="Special instructions..." />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-600" />
              Payment Method
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30"
                      : "border-border hover:border-brand-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-brand-600"
                  />
                  <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? "text-brand-600" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-semibold text-sm">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                  {item.name} {item.variant && `(${item.variant})`} x{item.quantity}
                </span>
                <span className="font-medium shrink-0">{formatPrice(Number(item.price) * item.quantity)}</span>
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
              <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-brand-700 dark:text-brand-400">{formatPrice(total)}</span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
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
            <Lock className="w-3 h-3" /> Secure checkout
          </p>
        </div>
      </form>
    </div>
  );
}
