import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all hostnames
        pathname: "/**", // Allows all paths
      },
      /*
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Add other patterns if needed
      */
    ],
  },
  experimental: {
    optimizePackageImports: ["@clerk/nextjs"],
  },
};

export default nextConfig;
