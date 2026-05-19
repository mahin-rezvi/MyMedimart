import Link from "next/link";

const PROMOS = [
  {
    title: "New Arrivals",
    subtitle: "Fresh tech, fashion & more just landed — be the first to shop.",
    cta: "Explore Now",
    href: "/products?sort=newest",
    from: "#1e3a5f", to: "#0ea5e9",
    icon: "✨",
    badge: "NEW",
    badgeColor: "bg-cyan-400 text-cyan-950",
    pattern: "circles",
  },
  {
    title: "0% EMI Plans",
    subtitle: "Pay in easy installments on orders over ৳10,000 — no hidden fees.",
    cta: "Shop on EMI",
    href: "/products?emi=true",
    from: "#2e1065", to: "#9333ea",
    icon: "💳",
    badge: "HOT",
    badgeColor: "bg-purple-300 text-purple-950",
    pattern: "diamonds",
  },
  {
    title: "Free Delivery",
    subtitle: "Nationwide free shipping on every order above ৳1,000.",
    cta: "Start Shopping",
    href: "/products",
    from: "#052e16", to: "#10b981",
    icon: "🚀",
    badge: "FREE",
    badgeColor: "bg-emerald-300 text-emerald-950",
    pattern: "waves",
  },
];

export default function PromoSection() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROMOS.map((promo) => (
          <div
            key={promo.title}
            className="relative rounded-3xl p-6 text-white overflow-hidden group cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${promo.from}, ${promo.to})` }}
          >
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Glow orb */}
            <div
              className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-25 blur-2xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-110"
              style={{ background: promo.to }}
            />

            {/* Large bg icon */}
            <div className="absolute -right-3 -top-2 text-[80px] opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 select-none">
              {promo.icon}
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{promo.icon}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider ${promo.badgeColor}`}>
                  {promo.badge}
                </span>
              </div>
              <h3 className="font-display text-xl font-black mb-2 leading-tight">{promo.title}</h3>
              <p className="text-white/65 text-xs leading-relaxed mb-5">{promo.subtitle}</p>
              <Link
                href={promo.href}
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/20 hover:scale-105 active:scale-95"
              >
                {promo.cta}
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
