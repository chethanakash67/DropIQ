import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const localBackend = "http://localhost:3001";
const prodBackend = "https://dropiq-t62y.onrender.com";

// Use NEXT_PUBLIC_API_URL if set, otherwise toggle based on environment
const backendUrl = (process.env.NEXT_PUBLIC_API_URL || (isProd ? prodBackend : localBackend)).replace(/\/$/, "");

console.log(`[NextConfig] Using Backend API: ${backendUrl} (${isProd ? 'PRODUCTION' : 'DEVELOPMENT'})`);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
