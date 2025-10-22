import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimization
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Compression and performance
  compress: true,

  // Headers for security and performance
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/auth",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },

  // Rewrites
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  },

  // Turbopack configuration (Next.js 16+)
  turbopack: {},

  // Webpack configuration for optimization (webpack mode only)
  webpack: (config) => {
    // Only apply webpack optimizations if explicitly using webpack
    if (process.env.NEXT_WEBPACK === "true") {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        firebase: {
          test: /[\\/]node_modules[\\/](firebase)[\\/]/,
          name: "firebase",
          priority: 10,
        },
        UI: {
          test: /[\\/]node_modules[\\/](recharts|lucide-react)[\\/]/,
          name: "UI",
          priority: 10,
        },
      };
    }

    return config;
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react"],
  },
};

export default nextConfig;
