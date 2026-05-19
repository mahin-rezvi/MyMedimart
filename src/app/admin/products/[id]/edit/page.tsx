"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, X, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRef } from "react";

const DEFAULT_CATEGORIES = ["Electronics", "Computers", "Fashion", "Home & Living", "Health & Beauty", "Grocery", "Sports", "Baby", "Kitchen", "Books", "Pharmacy", "Others"];
const DEFAULT_BRANDS = ["Samsung", "Apple", "Sony", "HP", "ASUS", "Lenovo", "LG", "Realme", "Xiaomi", "Walton", "Singer", "Philips", "Unbranded"];

interface ImagePreview { file?: File; url: string }

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [specRows, setSpecRows] = useState([{ key: "", value: "" }]);
  const [form, setForm] = useState({
    name: "", sku: "", price: "", discountPrice: "", stock: "",
    category: "", brand: "", description: "", shortDesc: "",
    isActive: true, isFeatured: false, isFlashSale: false, tags: "",
  });

  useEffect(() => {
    async function load() {
      try {
        if (!db) { toast.error("Firestore not configured"); router.push("/admin/products"); return; }
        const firestore = db;
        const snap = await getDoc(doc(firestore, "products", id));
        if (!snap.exists()) { toast.error("Product not found"); router.push("/admin/products"); return; }
        const d = snap.data();
        setForm({
          name: d.name ?? "", sku: d.sku ?? "", price: String(d.price ?? ""),
          discountPrice: String(d.discountPrice ?? ""), stock: String(d.stock ?? ""),
          category: d.category ?? "", brand: d.brand ?? "",
          description: d.description ?? "", shortDesc: d.shortDesc ?? "",
          isActive: d.isActive ?? true, isFeatured: d.isFeatured ?? false,
          isFlashSale: d.isFlashSale ?? false,
          tags: Array.isArray(d.tags) ? d.tags.join(", ") : (d.tags ?? ""),
        });
        if (d.images) setImages((d.images as string[]).map((url) => ({ url })));
        if (d.specs) setSpecRows(Object.entries(d.specs).map(([key, value]) => ({ key, value: String(value) })));
      } catch { toast.error("Failed to load product"); }
      finally { setFetching(false); }
    }
    if (id) load();
  }, [id, router]);

  const update = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));
  const handleImages = (files: FileList | null) => {
    if (!files) return;
    const previews: ImagePreview[] = Array.from(files).slice(0, 8 - images.length).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...previews]);
  };
  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));
  const addSpec = () => setSpecRows((p) => [...p, { key: "", value: "" }]);
  const updateSpec = (i: number, k: "key" | "value", v: string) => setSpecRows((p) => p.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const img of images) {
        if (!img.file) { uploadedUrls.push(img.url); continue; }
        const fd = new FormData();
        fd.append("file", img.file);
        fd.append("folder", "products");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (res.ok) uploadedUrls.push((await res.json()).url);
      }
      const specs = Object.fromEntries(specRows.filter((r) => r.key && r.value).map((r) => [r.key, r.value]));
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id, ...form,
          price: parseFloat(form.price),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          stock: parseInt(form.stock),
          images: uploadedUrls, specs,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      if (res.ok) { toast.success("Product updated!"); router.push("/admin/products"); }
      else toast.error("Update failed");
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {[1,2,3].map((i) => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost p-2 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="font-display text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground text-sm font-mono text-xs">{id}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold">Basic Information</h2>
            <div><label className="text-sm font-medium mb-1 block">Product Name *</label><input required value={form.name} onChange={(e) => update("name", e.target.value)} className="form-input" /></div>
            <div><label className="text-sm font-medium mb-1 block">Short Description</label><input value={form.shortDesc} onChange={(e) => update("shortDesc", e.target.value)} className="form-input" /></div>
            <div><label className="text-sm font-medium mb-1 block">Full Description</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="form-input resize-none" /></div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Product Images</h2>
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleImages(e.dataTransfer.files); }} onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 transition-all">
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Add more images or drag & drop</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-1 left-1 bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full">Main</span>}
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Specifications</h2><button type="button" onClick={addSpec} className="btn-ghost text-sm px-3 py-1.5 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Row</button></div>
            <div className="space-y-2">
              {specRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input value={row.key} onChange={(e) => updateSpec(i, "key", e.target.value)} placeholder="Property" className="form-input text-sm h-9 flex-1" />
                  <input value={row.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="Value" className="form-input text-sm h-9 flex-1" />
                  <button type="button" onClick={() => setSpecRows((p) => p.filter((_, idx) => idx !== i))} className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold">Pricing & Stock</h2>
            <div><label className="text-sm font-medium mb-1 block">Regular Price (৳) *</label><input required type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className="form-input" min="0" /></div>
            <div><label className="text-sm font-medium mb-1 block">Sale Price (৳)</label><input type="number" value={form.discountPrice} onChange={(e) => update("discountPrice", e.target.value)} className="form-input" min="0" /></div>
            <div><label className="text-sm font-medium mb-1 block">Stock Quantity *</label><input required type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} className="form-input" min="0" /></div>
            <div><label className="text-sm font-medium mb-1 block">SKU</label><input value={form.sku} onChange={(e) => update("sku", e.target.value)} className="form-input font-mono text-sm" /></div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold">Organization</h2>
            <div><label className="text-sm font-medium mb-1 block">Category *</label><select required value={form.category} onChange={(e) => update("category", e.target.value)} className="form-input"><option value="">Select category</option>{DEFAULT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="text-sm font-medium mb-1 block">Brand</label><select value={form.brand} onChange={(e) => update("brand", e.target.value)} className="form-input"><option value="">Select brand</option>{DEFAULT_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
            <div><label className="text-sm font-medium mb-1 block">Tags</label><input value={form.tags} onChange={(e) => update("tags", e.target.value)} className="form-input text-sm" placeholder="tag1, tag2" /></div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold mb-3">Options</h2>
            {[{ key: "isActive", label: "Active" }, { key: "isFeatured", label: "Featured" }, { key: "isFlashSale", label: "Flash Sale" }].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={(e) => update(key, e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 h-11">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Update Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
