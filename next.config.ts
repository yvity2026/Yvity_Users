import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@tensorflow/tfjs",
    "@tensorflow/tfjs-backend-webgl",
    "@tensorflow-models/face-landmarks-detection",
    "@tensorflow-models/face-detection",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
