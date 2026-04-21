import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker — produces minimal standalone build
  output: "standalone",
};

export default nextConfig;
