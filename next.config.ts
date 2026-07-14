import type { NextConfig } from "next";

const revision = crypto.randomUUID();

const withSerwist = require("@serwist/next").default({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/offline", revision }],
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: false,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all hostnames
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {},
};

export default withSerwist(nextConfig);
