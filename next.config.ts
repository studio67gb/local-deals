import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { allowedOrigins: ["local-deals.uk", "www.local-deals.uk"] } },
};

export default nextConfig;
