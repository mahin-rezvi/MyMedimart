import HeroBanner from "@/components/home/hero-banner";
import CategoryGrid from "@/components/home/category-grid";
import FlashSaleSection from "@/components/home/flash-sale-section";
import FeaturedProducts from "@/components/home/featured-products";
import BrandStrip from "@/components/home/brand-strip";
import PromoSection from "@/components/home/promo-section";
import TrendingProducts from "@/components/home/trending-products";
import NewsletterSection from "@/components/home/newsletter-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MediMart — Bangladesh's Premier Online Marketplace",
  description:
    "Shop electronics, fashion, health products, groceries and more. Fast delivery, best prices, 100% authentic.",
};

export default function HomePage() {
  return (
    <div className="space-y-0">
      <HeroBanner />
      <div className="max-w-7xl mx-auto px-4">
        <CategoryGrid />
        <FlashSaleSection />
        <PromoSection />
        <FeaturedProducts />
        <BrandStrip />
        <TrendingProducts />
        <NewsletterSection />
      </div>
    </div>
  );
}
