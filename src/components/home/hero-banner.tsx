"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: 1,
    badge: "🔥 Mega Sale",
    title: "Next-Gen\nElectronics",
    subtitle: "Smartphones, laptops & accessories at unbeatable prices",
    cta: "Shop Now",
    ctaSecondary: "Browse All",
    href: "/category/electronics",
    hrefSecondary: "/products",
    gradient: "from-[#0f172a] via-[#1e3a5f] to-[#0c4a6e]",
    glow: "#0ea5e9",
    glowSecondary: "#38bdf8",
    tag: "Up to 40% OFF",
    emoji: "⚡",
    stats: [
      { label: "Products", value: "50K+" },
      { label: "Brands", value: "500+" },
      { label: "Saved", value: "৳ 2Cr+" },
    ],
  },
  {
    id: 2,
    badge: "⚡ Flash Sale",
    title: "Limited\nDeals Today!",
    subtitle: "Grab massive discounts before stock runs out",
    cta: "View Deals",
    ctaSecondary: "Set Alert",
    href: "/flash-sale",
    hrefSecondary: "/flash-sale",
    gradient: "from-[#1a0a00] via-[#7c1d0c] to-[#c2410c]",
    glow: "#f97316",
    glowSecondary: "#fb923c",
    tag: "Ends in 8 hrs",
    emoji: "🔥",
    stats: [
      { label: "Flash Deals", value: "200+" },
      { label: "Max Discount", value: "70%" },
      { label: "Time Left", value: "8hr" },
    ],
  },
  {
    id: 3,
    badge: "💊 Healthcare",
    title: "Health &\nWellness",
    subtitle: "Medicines, supplements & healthcare from trusted brands",
    cta: "Shop Health",
    ctaSecondary: "Consult Now",
    href: "/category/health",
    hrefSecondary: "/category/health",
    gradient: "from-[#022c22] via-[#064e3b] to-[#065f46]",
    glow: "#10b981",
    glowSecondary: "#34d399",
    tag: "100% Authentic",
    emoji: "🌿",
    stats: [
      { label: "Medicines", value: "10K+" },
      { label: "Brands", value: "100+" },
      { label: "Orders/day", value: "5K+" },
    ],
  },
  {
    id: 4,
    badge: "👗 New Arrivals",
    title: "Fashion\nForward",
    subtitle: "Latest trends in men's, women's & kids fashion",
    cta: "Shop Fashion",
    ctaSecondary: "View Lookbook",
    href: "/category/fashion",
    hrefSecondary: "/category/fashion",
    gradient: "from-[#1e0733] via-[#4c1d95] to-[#6d28d9]",
    glow: "#a855f7",
    glowSecondary: "#c084fc",
    tag: "New Season",
    emoji: "✨",
    stats: [
      { label: "Styles", value: "20K+" },
      { label: "Designers", value: "300+" },
      { label: "Happy Buyers", value: "1M+" },
    ],
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (animating) return;
      setAnimating(true);
      setCurrent(idx);
      setTimeout(() => setAnimating(false), 600);
    },
    [animating]
  );

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(
    () => goTo((current + 1) % SLIDES.length),
    [current, goTo]
  );

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <div className="relative h-[480px] md:h-[580px] overflow-hidden">
      {/* ── Animated background ── */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-700",
          slide.gradient
        )}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glowing orbs */}
      <div
        className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${slide.glow}, transparent 70%)` }}
      />
      <div
        className="absolute -left-20 bottom-0 w-80 h-80 rounded-full opacity-15 blur-3xl transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${slide.glowSecondary}, transparent 70%)` }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div
            className={cn(
              "max-w-2xl transition-all duration-500",
              animating ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
            )}
          >
            {/* Badge */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-sm border border-white/25 shadow-lg"
                style={{ boxShadow: `0 0 12px ${slide.glow}50` }}
              >
                {slide.badge}
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/15">
                {slide.tag}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl md:text-7xl font-black text-white mb-5 leading-[1.05] tracking-tight">
              {slide.title.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {i === 1 ? (
                    <span
                      className="text-transparent bg-clip-text"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${slide.glow}, ${slide.glowSecondary})`,
                      }}
                    >
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-white/70 mb-8 max-w-md leading-relaxed">
              {slide.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${slide.glow}, ${slide.glowSecondary})`,
                  color: "#fff",
                  boxShadow: `0 8px 32px ${slide.glow}60`,
                }}
              >
                <Zap className="w-4 h-4" />
                {slide.cta}
              </Link>
              <Link
                href={slide.hrefSecondary}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-7 py-3.5 rounded-2xl text-sm hover:bg-white/20 transition-all border border-white/20 hover:scale-105 active:scale-95"
              >
                {slide.ctaSecondary}
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6">
              {slide.stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-8 bg-white/15" />}
                  <div>
                    <p className="text-white font-black text-lg leading-none">{stat.value}</p>
                    <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 backdrop-blur-md hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-all border border-white/20 hover:scale-110"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 backdrop-blur-md hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-all border border-white/20 hover:scale-110"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-400",
              i === current ? "w-10 bg-white" : "w-1.5 bg-white/35 hover:bg-white/60"
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
    </div>
  );
}
