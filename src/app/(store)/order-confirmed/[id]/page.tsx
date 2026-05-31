import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Download, Package, Truck, Home, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ordersRepo } from "@/lib/db/repositories";

const TIMELINE = [
  { label: "Order Placed", done: true, icon: CheckCircle },
  { label: "Processing", done: true, icon: Package },
  { label: "Shipped", done: false, icon: Truck },
  { label: "Delivered", done: false, icon: Home },
];

export default async function OrderConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;
  const order = await ordersRepo.getById(orderId);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shipping_address ?? {};
  const customer = {
    name: shippingAddress.fullName ?? "Customer",
    phone: shippingAddress.phone ?? "",
    email: shippingAddress.email ?? "",
  };
  const address = {
    street: shippingAddress.street ?? "",
    area: shippingAddress.area ?? "",
    city: shippingAddress.city ?? "",
  };
  const orderNumber = shippingAddress.orderNumber ?? String(order.id).slice(0, 8).toUpperCase();
  const paymentMethod = shippingAddress.paymentMethod ?? "Cash on Delivery";
  const shippingCost = Number(shippingAddress.shippingCost ?? 0);
  const totalAmount = Number(order.total_price ?? 0);
  const subtotal = totalAmount - shippingCost;
  const items = Array.isArray(order.items) ? order.items : [];
  const emailSent = Boolean(shippingAddress.notificationStatus?.emailSent);
  const whatsappSent = Boolean(shippingAddress.notificationStatus?.whatsappSent);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Order Confirmed! 🎉</h1>
        <p className="text-muted-foreground">
          Thank you <strong>{customer.name}</strong>! Your order <strong>{orderNumber}</strong> has been placed successfully.
        </p>
        {customer.email && (
          <p className="text-muted-foreground text-sm mt-2">
            {emailSent
              ? <>A copy of your invoice has been emailed to <strong>{customer.email}</strong>.</>
              : <>Your invoice is ready to download. Email delivery is pending.</>}
          </p>
        )}
        <div className="mt-4 inline-flex flex-col sm:flex-row gap-2 items-center justify-center">
          <span className="bg-muted px-4 py-2 rounded-xl text-sm font-mono font-bold">{orderNumber}</span>
          <span className="text-muted-foreground text-sm">•</span>
          <span className="text-muted-foreground text-sm">Order ID: <strong>{orderId}</strong></span>
        </div>
      </div>

      {/* WhatsApp Notice */}
      <div className={`${whatsappSent ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"} border rounded-2xl p-4 mb-6 flex items-start gap-3`}>
        <span className="text-2xl">📱</span>
        <div>
          <p className={`${whatsappSent ? "text-green-800 dark:text-green-400" : "text-amber-800 dark:text-amber-400"} font-semibold text-sm`}>
            {whatsappSent ? "WhatsApp Confirmation Sent" : "WhatsApp Confirmation Pending"}
          </p>
          <p className={`${whatsappSent ? "text-green-700 dark:text-green-500" : "text-amber-700 dark:text-amber-500"} text-xs mt-0.5`}>
            {whatsappSent
              ? "Order details have been sent to our team via WhatsApp. We'll confirm within 30 minutes."
              : "Your order was saved, but WhatsApp delivery is not configured or failed. We will confirm it from the admin panel."}
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
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.name} {item.variant && `(${item.variant})`} ×{item.qty}</span>
              <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total Paid</span>
              <span className="text-brand-700 dark:text-brand-400">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-muted/50 p-5 border-t border-border grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold tracking-wide">Delivery Address</p>
            <p className="font-medium">{customer.name}</p>
            <p className="text-muted-foreground">{address.street}</p>
            <p className="text-muted-foreground">{address.area}{address.area && address.city ? ", " : ""}{address.city}</p>
            <p className="text-muted-foreground">{customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold tracking-wide">Payment</p>
            <p className="font-medium">{paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}</p>
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
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "880"}?text=${encodeURIComponent(`Hi, I want to confirm my order ${orderNumber}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-xl px-4 py-3 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Confirm on WhatsApp
        </a>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-sm text-brand-600 hover:underline">← Continue Shopping</Link>
      </div>
    </div>
  );
}
