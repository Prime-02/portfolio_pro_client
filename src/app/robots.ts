// src/app/robots.ts
import { BASE_URL } from "@/lib/utilities/syncFunctions/syncs";
import type { MetadataRoute } from "next";


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
