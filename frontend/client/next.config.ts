import type { NextConfig } from "next";
import path from "path";

const defaultBackendUrl = process.env.NODE_ENV === "production"
  ? "https://dropiq-t62y.onrender.com"
  : "http://localhost:3001";
const backendUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || defaultBackendUrl).replace(/\/$/, "");

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
