import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@trace/db", "@trace/events", "@trace/integrations", "@trace/shared"],
  typedRoutes: true,
};

export default nextConfig;
