import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Large PNG assets in public/ slow first dev compile on some filesystems.
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  }
};

export default nextConfig;
