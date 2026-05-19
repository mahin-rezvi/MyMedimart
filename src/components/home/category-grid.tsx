import Link from "next/link";
import {
  Smartphone, Laptop, Shirt, Home, Pill, ShoppingBag,
  Cpu, Dumbbell, Baby, BookOpen, Utensils, Car,
} from "lucide-react";

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", icon: Smartphone, gradient: "from-blue-500 to-blue-600", shadow: "shadow-blue-200 dark:shadow-blue-900/30" },
  { name: "Computers", slug: "computers", icon: Laptop, gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-200 dark:shadow-violet-900/30" },
  { name: "Fashion", slug: "fashion", icon: Shirt, gradient: "from-pink-500 to-rose-600", shadow: "shadow-pink-200 dark:shadow-pink-900/30" },
  { name: "Home", slug: "home", icon: Home, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-200 dark:shadow-amber-900/30" },
  { name: "Health", slug: "health", icon: Pill, gradient: "from-emerald-500 to-green-600", shadow: "shadow-emerald-200 dark:shadow-emerald-900/30" },
  { name: "Groceries", slug: "grocery", icon: ShoppingBag, gradient: "from-orange-500 to-red-500", shadow: "shadow-orange-200 dark:shadow-orange-900/30" },
  { name: "Components", slug: "components", icon: Cpu, gradient: "from-cyan-500 to-teal-600", shadow: "shadow-cyan-200 dark:shadow-cyan-900/30" },
  { name: "Sports", slug: "sports", icon: Dumbbell, gradient: "from-red-500 to-rose-600", shadow: "shadow-red-200 dark:shadow-red-900/30" },
  { name: "Baby & Toys", slug: "baby", icon: Baby, gradient: "from-rose-400 to-pink-500", shadow: "shadow-rose-200 dark:shadow-rose-900/30" },
  { name: "Kitchen", slug: "kitchen", icon: Utensils, gradient: "from-yellow-500 to-amber-500", shadow: "shadow-yellow-200 dark:shadow-yellow-900/30" },
  { name: "Books", slug: "books", icon: BookOpen, gradient: "from-indigo-500 to-blue-600", shadow: "shadow-indigo-200 dark:shadow-indigo-900/30" },
  { name: "Automotive", slug: "automotive", icon: Car, gradient: "from-slate-500 to-gray-600", shadow: "shadow-slate-200 dark:shadow-slate-900/30" },
];

export default function CategoryGrid() {
  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="text-muted-foreground text-sm mt-1">Browse 50,000+ products across all categories</p>
        </div>
        <Link
          href="/products"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
        >
          All categories
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-12 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center gap-2.5 p-3 rounded-2xl hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-md ${cat.shadow} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
            >
              <cat.icon className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-center text-foreground/70 group-hover:text-brand-600 transition-colors leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
