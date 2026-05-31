import Link from "next/link";
import { ArrowUpRight, Database, Package, ShoppingCart, Tag, Users } from "lucide-react";

const RESOURCES = [
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    description: "Create, edit, publish, and remove catalog items.",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "Review order details and move orders through fulfillment.",
  },
  {
    label: "Customers",
    href: "/admin/users",
    icon: Users,
    description: "Manage customer access, status, and admin roles.",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tag,
    description: "Maintain storefront categories used by products.",
  },
];

export default function AdminResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Resource Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Central access to the Neon-backed CRUD screens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {RESOURCES.map((resource) => (
          <Link
            key={resource.href}
            href={resource.href}
            className="bg-card border border-border rounded-2xl p-5 hover:border-brand-400 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mb-4">
              <resource.icon className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{resource.label}</h2>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-600" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{resource.description}</p>
          </Link>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Database Source</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Products, categories, users, carts, settings, and orders are managed through Neon Postgres APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
