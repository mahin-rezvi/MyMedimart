import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.startech.com.bd" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },

  // Allow LAN IPs to connect to the dev server (HMR over network)
  allowedDevOrigins: ["192.168.0.55", "192.168.1.*", "*.local"],

  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  // Security + performance headers applied to every response
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Block clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // XSS filter (legacy browsers)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // HTTPS-only when in production
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
            : []),
          // Remove the server fingerprint header
          { key: "X-Powered-By", value: "" },
        ],
      },
      // Static asset long-cache — production only (Turbopack handles this in dev)
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/_next/static/:path*",
              headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
          ]
        : []),
      {
        // Moderate caching for public images
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
