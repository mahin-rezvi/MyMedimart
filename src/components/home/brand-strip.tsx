const BRANDS = [
  "Samsung", "Apple", "Sony", "LG", "HP", "Dell", "Lenovo",
  "ASUS", "Realme", "Xiaomi", "Logitech", "Walton", "Singer",
  "Philips", "JBL", "Microsoft",
];

export default function BrandStrip() {
  return (
    <section className="py-8 border-y border-border">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="section-title text-xl">Top Brands</h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {BRANDS.map((brand) => (
          <a
            key={brand}
            href={`/brand/${brand.toLowerCase()}`}
            className="shrink-0 px-5 py-2.5 rounded-xl border border-border hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all duration-200 text-sm font-semibold text-muted-foreground hover:text-brand-600 whitespace-nowrap"
          >
            {brand}
          </a>
        ))}
      </div>
    </section>
  );
}
