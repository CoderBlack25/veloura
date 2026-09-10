import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket URL (TRD Section 3.2) — replace the
      // hostname with your actual R2_PUBLIC_URL once the bucket exists.
      { protocol: "https", hostname: "media.veloura.com" },
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
};

export default nextConfig;
