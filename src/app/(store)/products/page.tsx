import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsClientPage from "@/components/products/products-client-page";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our full catalog of electronics, fashion, health products and more.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center">Loading products...</div>}>
      <ProductsClientPage />
    </Suspense>
  );
}
