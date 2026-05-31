import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/providers/providers";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
    siteName: "MediMart",
    title: "MediMart — Bangladesh's Premier Online Marketplace",
    description: "Shop electronics, fashion, health & more. Fast delivery, best prices.",
  },
  twitter: { card: "summary_large_image", title: "MediMart" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

/**
 * Blocking inline script — runs synchronously before first paint to apply
 * the correct theme class without any flash. Must be a plain string so
 * Next.js does NOT defer or bundle it.
 */
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var preferred = stored || 'system';
    var isDark =
      preferred === 'dark' ||
      (preferred === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  } catch(e) {}
})();
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking theme script — prevents flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
