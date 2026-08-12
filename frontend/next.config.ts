import type { NextConfig } from "next";

// Proxy API calls to the Express backend so the frontend never deals with CORS.
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:5000").replace(
  /\/+$/,
  ""
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
