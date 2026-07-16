// src/app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://portfolio-pro-client.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/user-auth",
        "/user-auth/*",
        "/*/testimonials/write",
        "/*/projects/*/collaborators",
        "/api/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
