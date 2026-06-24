import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal, self-contained server build for the Docker image.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
