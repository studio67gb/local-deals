import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { allowedOrigins: ["local-deals.uk", "www.local-deals.uk"] } },
  async rewrites() {
    return [
      { source: '/advertise', destination: '/register' },
      { source: '/partner', destination: '/register' },
    ];
  },
};

export default nextConfig;
