import React from 'react'
import { ProjectDetailPage } from '../../components/projects'
import type { Metadata } from "next";
import { fetchForMetadata } from "@/lib/server/fetchMetadata";
import { PortfolioProjectResponse } from '@/lib/stores/projects/types/project.types';

const BASE_URL = "https://portfolio-pro-client.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string }>;
}): Promise<Metadata> {
  const { project } = await params;
  const data = await fetchForMetadata<PortfolioProjectResponse>(`projects/${project}`);

  if (!data) return { title: "Project not found" };

  return {
    title: data.project_name,
    description: data.project_summary,
    alternates: { canonical: `${BASE_URL}/projects/${project}` },
    openGraph: {
      title: data.project_name,
      description: data.project_summary || "",
      type: "website",
      images: data.project_image_url ? [{ url: data.project_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.project_name,
      images: data.project_image_url ? [data.project_image_url] : undefined,
    },
  };
}

const page = async ({
  params,
}: {
  params: Promise<{ project: string }>;
}) => {
  const { project } = await params;
  const data = await fetchForMetadata<PortfolioProjectResponse>(`projects/${project}`);

  const projectCreator = data?.user_associations.find((creator) => creator.role === "creator")
  
  const jsonLd = data
    ? {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: data.project_name,
      description: data.project_summary,
      image: data.project_image_url ? [data.project_image_url] : undefined,
      dateCreated: data.start_date,
      dateModified: data.last_updated,
      creator: projectCreator?.user
        ? {
          "@type": "Person",
          name: `${projectCreator.user.display_name ?? ""}`.trim(),
          url: `${BASE_URL}/${projectCreator.user.username}`,
        }
        : undefined,
      keywords: data.tags?.join(", "),
    }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProjectDetailPage isPublicView />
    </>
  );
};

export default page;