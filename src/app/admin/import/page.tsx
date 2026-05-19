"use client";

import { useState } from "react";
import { Upload, FileJson, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

type ImportStatus = "idle" | "loading" | "success" | "error";

const IMPORT_TYPES = ["products", "categories", "brands"];
const EXPORT_TYPES = ["products", "categories", "orders", "users", "banners", "coupons"];

function getExportFilename(type: string) {
  return `${type}-export-${new Date().toISOString()}.json`;
}

const SAMPLE_JSON: Record<string, string> = {
  products: JSON.stringify([{
    name: "Sample Product",
    price: 1000,
    discountPrice: 800,
    stock: 10,
    category: "Electronics",
    brand: "Samsung",
    description: "A great product",
    sku: "SAMP-001",
    isFeatured: false,
    isFlashSale: false,
    isActive: true,
    tags: ["new", "sale"],
    images: [],
  }], null, 2),
  categories: JSON.stringify([{ name: "Electronics", slug: "electronics", icon: "📱", isActive: true }], null, 2),
  brands: JSON.stringify([{ name: "Samsung", slug: "samsung", isActive: true }], null, 2),
};

export default function DataImportPage() {
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [result, setResult] = useState<{ imported: number; errors: string[]; total: number } | null>(null);
  const [importType, setImportType] = useState("products");
  const [exporting, setExporting] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setJsonText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonText.trim()) { toast.error("Please paste or upload JSON data"); return; }
    let parsed;
    try { parsed = JSON.parse(jsonText); } catch { toast.error("Invalid JSON format"); return; }

    setStatus("loading");
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: importType, data: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setResult(data);
        toast.success(`Imported ${data.imported} ${importType} to Firestore`);
      } else {
        setStatus("error");
        toast.error(data.error || "Import failed");
      }
    } catch {
      setStatus("error");
      toast.error("Network error during import");
    }
  };

  const handleExport = async (type: string) => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);
      if (!res.ok) { toast.error("Export failed"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getExportFilename(type);
      a.click();
      toast.success(`Exported ${type} as JSON`);
    } catch { toast.error("Export failed"); }
    finally { setExporting(false); }
  };

  const validJson = (() => { try { const p = JSON.parse(jsonText); return { valid: true, count: Array.isArray(p) ? p.length : 1 }; } catch { return { valid: false, count: 0 }; } })();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Data Import / Export</h1>
        <p className="text-muted-foreground text-sm mt-1">Bulk import from JSON to Firestore, or export collections as JSON</p>
      </div>

      {/* Export Section */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Export Collections</h2>
        <p className="text-sm text-muted-foreground mb-4">Download any Firestore collection as a JSON file</p>
        <div className="flex gap-2 flex-wrap">
          {EXPORT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium capitalize hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Import Type */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Import Type</h2>
        <div className="flex gap-3 flex-wrap">
          {IMPORT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => { setImportType(type); setStatus("idle"); setResult(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border-2 ${importType === type ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30 text-brand-700" : "border-border"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* JSON Input */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">JSON Data</h2>
          <div className="flex gap-2">
            <button onClick={() => setJsonText(SAMPLE_JSON[importType] ?? "")} className="text-xs px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              Load Sample
            </button>
            <label className="text-xs px-3 py-1.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 rounded-lg cursor-pointer hover:bg-brand-100 transition-colors flex items-center gap-1">
              <Upload className="w-3 h-3" /> Upload JSON
              <input type="file" accept=".json" className="hidden" onChange={handleFile} />
            </label>
          </div>
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={14}
          placeholder={`Paste your ${importType} JSON array here…\n\nExample:\n[\n  { "name": "Product Name", "price": 1000, "stock": 10 }\n]`}
          className="form-input resize-none font-mono text-xs w-full"
        />
      </div>

      {/* Validation Preview */}
      {jsonText && (
        validJson.valid ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-2">
            <FileJson className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              Valid JSON · {validJson.count} {importType} ready to import to Firestore
            </span>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700 dark:text-red-400 font-medium">Invalid JSON format</span>
          </div>
        )
      )}

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={status === "loading" || !jsonText.trim()}
        className="btn-primary h-11 px-8 flex items-center gap-2"
      >
        {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing to Firestore…</> : <><Upload className="w-4 h-4" /> Import {importType}</>}
      </button>

      {/* Result */}
      {status === "success" && result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800 dark:text-green-400">Import Successful</h3>
          </div>
          <p className="text-sm text-green-700 dark:text-green-500">✓ {result.imported} / {result.total} {importType} imported to Firestore</p>
          {result.errors.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Warnings:</p>
              {result.errors.map((e, i) => <p key={i} className="text-xs text-amber-600">{e}</p>)}
            </div>
          )}
        </div>
      )}

      {/* Format Guide */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">JSON Format Guide</h2>
        <div className="text-xs font-mono bg-muted rounded-xl p-4 text-muted-foreground overflow-x-auto">
          <pre>{`// Products
[{
  "name": "string (required)",
  "price": number (required),
  "discountPrice": number (optional),
  "stock": number (required),
  "category": "category name",
  "brand": "brand name",
  "description": "string",
  "shortDesc": "string",
  "images": ["https://url1", "https://url2"],
  "sku": "PROD-001",
  "tags": ["tag1", "tag2"],
  "isFeatured": boolean,
  "isFlashSale": boolean,
  "isActive": boolean
}]

// Categories
[{ "name": "Electronics", "slug": "electronics", "icon": "📱" }]

// Brands
[{ "name": "Samsung", "slug": "samsung" }]`}</pre>
        </div>
      </div>
    </div>
  );
}
