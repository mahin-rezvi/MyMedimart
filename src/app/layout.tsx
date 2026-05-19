import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/providers/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "MediMart — Bangladesh's Premier Online Marketplace",
    template: "%s | MediMart",
  },
  description:
    "Shop the best deals on electronics, fashion, health products, groceries and more. Fast delivery across Bangladesh.",
  keywords: ["online shopping", "bangladesh", "ecommerce", "electronics", "fashion", "grocery"],
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "MediMart",
    title: "MediMart — Bangladesh's Premier Online Marketplace",
    description: "Shop electronics, fashion, health & more. Fast delivery, best prices.",
  },
  twitter: { card: "summary_large_image", title: "MediMart" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
