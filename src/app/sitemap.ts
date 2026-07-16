// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchForMetadata } from "@/lib/server/fetchMetadata";

const BASE_URL = "https://portfolio-pro-client.vercel.app";

interface BlogListItem {
  slug: string;
  updated_at: string;
}
interface ProjectListItem {
  id: string;
  updated_at: string;
}
interface PortfolioListItem {
  slug: string;
  updated_at: string;
  creator: { username: string } | null;
}
interface PublicUserItem {
  username: string;
  updated_at: string;
}
interface PublicUsersResponse {
  users: PublicUserItem[];
  total: number;
  skip: number;
  limit: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), priority: 1 },
    { url: `${BASE_URL}/feed`, lastModified: new Date(), priority: 0.8 },
  ];

  const [blogsData, projectsData, portfoliosData, usersData] =
    await Promise.all([
      fetchForMetadata<{ items: BlogListItem[] }>(
        "content/core/?page=1&size=200",
      ),
      fetchForMetadata<{ projects: ProjectListItem[] }>(
        "projects/public?page=1&size=200",
      ),
      fetchForMetadata<PortfolioListItem[]>(
        "portfolios/public?skip=0&limit=200",
      ),
      fetchForMetadata<PublicUsersResponse>(
        "user-multistep-form/users?skip=0&limit=200",
      ),
    ]);

  const blogRoutes: MetadataRoute.Sitemap = (blogsData?.items ?? []).map(
    (b) => ({
      url: `${BASE_URL}/blogs/${b.slug}`,
      lastModified: b.updated_at,
      priority: 0.7,
    }),
  );

  const projectRoutes: MetadataRoute.Sitemap = (
    projectsData?.projects ?? []
  ).map((p) => ({
    url: `${BASE_URL}/projects/${p.id}`,
    lastModified: p.updated_at,
    priority: 0.7,
  }));

  const portfolioRoutes: MetadataRoute.Sitemap = (portfoliosData ?? [])
    .filter((p) => p.creator?.username)
    .map((p) => ({
      url: `${BASE_URL}/${p.creator!.username}/portfolios/${p.slug}`,
      lastModified: p.updated_at,
      priority: 0.8,
    }));

  const profileRoutes: MetadataRoute.Sitemap = (usersData?.users ?? []).map(
    (u) => ({
      url: `${BASE_URL}/${u.username}`,
      lastModified: u.updated_at,
      priority: 0.6,
    }),
  );

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...projectRoutes,
    ...portfolioRoutes,
    ...profileRoutes,
  ];
}
