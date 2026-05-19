"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const BANNERS = [
  { id: "1", title: "Flash Sale Today!", subtitle: "Up to 50% OFF", link: "/flash-sale", order: 1, isActive: true },
  { id: "2", title: "New Electronics", subtitle: "Explore the latest gadgets", link: "/category/electronics", order: 2, isActive: true },
  { id: "3", title: "Health Week", subtitle: "Medicines and supplements on sale", link: "/category/health", order: 3, isActive: false },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState(BANNERS);

  const toggleBanner = (id: string) => {
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, isActive: !b.isActive } : b));
    toast.success("Banner updated");
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast.success("Banner deleted");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Banner Management</h1>
          <p className="text-muted-foreground text-sm">Manage homepage hero banners and sliders</p>
        </div>
        <button className="btn-primary flex items-center gap-2 h-10 px-4 text-sm">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      <div className="grid gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {banner.order}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{banner.title}</h3>
              <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
              <p className="text-xs text-brand-600 mt-1">{banner.link}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleBanner(banner.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${banner.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                {banner.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {banner.isActive ? "Active" : "Inactive"}
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-50 hover:text-brand-600 transition-colors">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deleteBanner(banner.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
