"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

interface Category { id: string; name: string; slug: string; icon?: string; isActive: boolean }

const ICONS = ["📱","💻","👕","🏠","💊","🛒","⚡","🏋️","👶","🍳","📚","🚗","🎮","🎵","💄","🧴"];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", icon: "📦", isActive: true });
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load categories");
      setCategories((data.categories ?? []).map((category: Category & { is_active?: boolean }) => ({
        ...category,
        isActive: category.isActive ?? category.is_active ?? true,
      })));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to load categories"); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Name is required"); return; }
    const slug = slugify(form.name);
    try {
      const payload = { ...form, slug, is_active: form.isActive };
      if (editId) {
        const res = await fetch("/api/admin/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Save failed");
        setCategories((prev) => prev.map((c) => c.id === editId ? { ...c, ...form, slug } : c));
        toast.success("Category updated");
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Save failed");
        setCategories((prev) => [...prev, { ...data.category, isActive: data.category.is_active }]);
        toast.success("Category created");
      }
      setForm({ name: "", icon: "📦", isActive: true });
      setEditId(null);
      setShowForm(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Save failed"); }
  };

  const handleEdit = (cat: Category) => { setForm({ name: cat.name, icon: cat.icon ?? "📦", isActive: cat.isActive }); setEditId(cat.id); setShowForm(true); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setCategories((prev) => prev.filter((c) => c.id !== id)); toast.success("Deleted");
    }
    catch (error) { toast.error(error instanceof Error ? error.message : "Delete failed"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold">Categories</h1><p className="text-muted-foreground text-sm">{categories.length} categories</p></div>
        <div className="flex gap-2">
          <button onClick={fetchCategories} className="btn-ghost p-2 rounded-lg"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", icon: "📦", isActive: true }); }} className="btn-primary flex items-center gap-2 h-10 px-4 text-sm">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold">{editId ? "Edit" : "New"} Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Name *</label><input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="form-input" placeholder="Electronics" /></div>
            <div>
              <label className="text-sm font-medium mb-1 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button key={icon} type="button" onClick={() => setForm((p) => ({ ...p, icon }))} className={`w-9 h-9 text-lg rounded-lg border-2 flex items-center justify-center transition-all ${form.icon === icon ? "border-brand-600 bg-brand-50" : "border-border hover:border-brand-300"}`}>{icon}</button>
                ))}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-brand-600" /><span className="text-sm">Active</span></label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary px-6 h-9 text-sm">{editId ? "Update" : "Create"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost px-6 h-9 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 space-y-3">{[1,2,3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
        : categories.length === 0 ? <div className="p-12 text-center"><p className="text-muted-foreground">No categories yet</p></div>
        : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50"><th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th><th className="text-left py-3 px-4 font-semibold text-muted-foreground">Slug</th><th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th><th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th></tr></thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4"><div className="flex items-center gap-2"><span className="text-xl">{cat.icon}</span><span className="font-medium">{cat.name}</span></div></td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                  <td className="py-3 px-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${cat.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{cat.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="py-3 px-4"><div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-50 hover:text-brand-600 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
