/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable gzip + brotli compression
  compress: true,

  // Remove console.log calls in production while preserving errors/warnings
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Optimize images (Firebase Storage, Google Cloud, Unsplash)
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600, // Avoid retaining replaced catalog imagery for a month.
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // High performance package import tree-shaking
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "antd",
      "framer-motion",
      "date-fns",
      "date-fns-tz",
      "swiper",
    ],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Caching and security headers
  async headers() {
    return [
      {
        // Preview deployments must not compete with the public storefront.
        source: "/:path*",
        has: [{ type: "host", value: "(?!neverbe\\.lk$|www\\.neverbe\\.lk$).+" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www\\.neverbe\\.lk" }],
        destination: "https://neverbe.lk/:path*",
        permanent: true,
      },
      {
        source: "/collections/deals",
        destination: "/collections/offers",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
