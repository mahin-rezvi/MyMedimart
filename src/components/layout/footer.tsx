"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, CreditCard, Truck, Shield, RotateCcw } from "lucide-react";

const FOOTER_LINKS = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
  ],
  "Customer Service": [
    { label: "How to Order", href: "/help/how-to-order" },
    { label: "Payment Methods", href: "/help/payment" },
    { label: "Shipping & Delivery", href: "/help/shipping" },
    { label: "Returns & Refunds", href: "/help/returns" },
    { label: "Track My Order", href: "/account/orders" },
    { label: "FAQ", href: "/faq" },
  ],
  "My Account": [
    { label: "Sign In", href: "/sign-in" },
    { label: "My Orders", href: "/account/orders" },
    { label: "My Wishlist", href: "/account/wishlist" },
    { label: "Saved Addresses", href: "/account/addresses" },
    { label: "Profile Settings", href: "/account" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Cookie Policy", href: "/legal/cookies" },
    { label: "Cancellation Policy", href: "/legal/cancellation" },
  ],
};

const TRUST_BADGES = [
  { icon: Truck, label: "Free Delivery", sublabel: "On orders over ৳1000" },
  { icon: Shield, label: "100% Authentic", sublabel: "All products verified" },
  { icon: RotateCcw, label: "Easy Returns", sublabel: "7-day return policy" },
  { icon: CreditCard, label: "Secure Payment", sublabel: "bKash, Nagad, Card" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 mt-16">
      {/* Trust Badges */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center shrink-0">
                <badge.icon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{badge.label}</p>
                <p className="text-slate-400 text-xs">{badge.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">M</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                <span className="text-brand-400">Medi</span>Mart
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Bangladesh&apos;s premier online marketplace. Shop electronics, fashion, health
              products, groceries and more with fast delivery nationwide.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>01781-452943</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@medimart.com.bd</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { label: "f", href: "https://facebook.com", name: "Facebook" },
                { label: "in", href: "https://instagram.com", name: "Instagram" },
                { label: "yt", href: "https://youtube.com", name: "YouTube" },
                { label: "x", href: "https://twitter.com", name: "Twitter" },
              ].map(({ label, href, name }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="w-9 h-9 bg-slate-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors text-white text-xs font-bold"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-brand-400 text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-white font-semibold">Subscribe to our newsletter</h4>
            <p className="text-slate-400 text-sm">Get deals, new arrivals & exclusive offers.</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-10 text-sm w-full md:w-64"
            />
            <button type="submit" className="btn-primary h-10 px-5 text-sm whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <p>© 2025 MediMart. All rights reserved.</p>
          <p>Made with ❤️ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
