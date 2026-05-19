"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("You're subscribed! Check your inbox.");
        setEmail("");
      } else {
        toast.error("Already subscribed or error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-10">
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-cyan-700 rounded-3xl p-10 text-center text-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-2">Stay in the Loop</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Subscribe to get flash sale alerts, exclusive deals, and new arrivals directly to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-70 text-sm whitespace-nowrap"
            >
              {loading ? "…" : "Subscribe"}
            </button>
          </form>
          <p className="text-white/50 text-xs mt-4">No spam, unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
