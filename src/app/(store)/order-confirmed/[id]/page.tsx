import Link from "next/link";
import { CheckCircle, Download, Package, Truck, Home } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const MOCK_ORDER = {
  id: "ord_123",
  orderNumber: "MM-ABC123-XYZ",
  invoiceNo: "INV-2512-45231",
  status: "CONFIRMED",
  paymentMethod: "COD",
  subtotal: 147997,
  shippingCost: 80,
  totalAmount: 148077,
  createdAt: new Date().toISOString(),
  customer: { name: "Rahim Ahmed", phone: "01781452943", email: "rahim@example.com" },
  address: { street: "12/A, Mirpur Road", area: "Mirpur-10", city: "Dhaka" },
  items: [
    { name: "Samsung Galaxy S24 Ultra", variant: "256GB", qty: 1, price: 129999 },
    { name: "JBL Flip 6 Speaker", variant: null, qty: 2, price: 8999 },
  ],
};

const TIMELINE = [
  { label: "Order Placed", done: true, icon: CheckCircle },
  { label: "Processing", done: true, icon: Package },
  { label: "Shipped", done: false, icon: Truck },
  { label: "Delivered", done: false, icon: Home },
];

export default async function OrderConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const order = MOCK_ORDER;
  const { id: orderId } = await params;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Order Confirmed! 🎉</h1>
        <p className="text-muted-foreground">
          Thank you <strong>{order.customer.name}</strong>! Your order <strong>{orderId}</strong> has been placed successfully.
        </p>
        <div className="mt-4 inline-flex flex-col sm:flex-row gap-2 items-center justify-center">
          <span className="bg-muted px-4 py-2 rounded-xl text-sm font-mono font-bold">{order.orderNumber}</span>
          <span className="text-muted-foreground text-sm">•</span>
          <span className="text-muted-foreground text-sm">Order ID: <strong>{orderId}</strong></span>
        </div>
      </div>

      {/* WhatsApp Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <span className="text-2xl">📱</span>
        <div>
          <p className="font-semibold text-green-800 dark:text-green-400 text-sm">WhatsApp Confirmation Sent</p>
          <p className="text-green-700 dark:text-green-500 text-xs mt-0.5">
            Order details have been sent to our team via WhatsApp. We&apos;ll confirm within 30 minutes.
          </p>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-5">Order Status</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" />
          {TIMELINE.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center gap-2 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step.done
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-background border-border text-muted-foreground"
              }`}>
                <step.icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-medium text-center ${step.done ? "text-green-600" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Order Details</h2>
        </div>
        <div className="p-5 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.name} {item.variant && `(${item.variant})`} ×{item.qty}</span>
              <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total Paid</span>
              <span className="text-brand-700 dark:text-brand-400">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-muted/50 p-5 border-t border-border grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold tracking-wide">Delivery Address</p>
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-muted-foreground">{order.address.street}</p>
            <p className="text-muted-foreground">{order.address.area}, {order.address.city}</p>
            <p className="text-muted-foreground">{order.customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold tracking-wide">Payment</p>
            <p className="font-medium">{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</p>
            <p className="text-muted-foreground text-xs mt-1">Payment due on delivery</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`/api/invoice/${order.id}`}
          className="flex-1 btn-outline flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download Invoice (PDF)
        </a>
        <Link href="/account/orders" className="flex-1 btn-primary flex items-center justify-center gap-2">
          <Package className="w-4 h-4" /> Track My Orders
        </Link>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-sm text-brand-600 hover:underline">← Continue Shopping</Link>
      </div>
    </div>
  );
}
