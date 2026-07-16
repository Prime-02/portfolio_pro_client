import PortfolioMain from '@/portfolio-builder/components/PortfolioMain'
import React from 'react'
import type { Metadata } from "next";
import { fetchForMetadata } from "@/lib/server/fetchMetadata";
import { PortfolioResponse } from '@/portfolio-builder/store/usePortfolioStore';
import { BASE_URL } from '@/lib/utilities/syncFunctions/syncs';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ portfolio: string }>;
}): Promise<Metadata> {
  const { portfolio } = await params;

  const data = await fetchForMetadata<PortfolioResponse>(
    `portfolios/public/${portfolio}`,
  );

  if (!data) return { title: "Portfolio not found" };

  const title = data.name || `Portfolio by ${data.creator?.username ?? "Unknown"}`;
  const canonicalUsername = data.creator?.username;

  return {
    title,
    description: data.description ?? `View this portfolio on Portfolio Pro`,
    alternates: {
      canonical: canonicalUsername
        ? `${BASE_URL}/${canonicalUsername}/portfolios/${portfolio}`
        : `${BASE_URL}/portfolios/${portfolio}`,
    },
    openGraph: {
      title,
      description: data.description ?? undefined,
      type: "website",
      images: data.cover_image_url ? [{ url: data.cover_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: data.cover_image_url ? [data.cover_image_url] : undefined,
    },
  };
}

const PortfolioViewPage = async ({
  params,
}: {
  params: Promise<{ portfolio: string }>;
}) => {
  const { portfolio } = await params;
  const data = await fetchForMetadata<PortfolioResponse>(
    `portfolios/public/${portfolio}`,
  );

  const jsonLd = data
    ? {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: data.name,
      description: data.description,
      image: data.cover_image_url ? [data.cover_image_url] : undefined,
      dateCreated: data.created_at,
      dateModified: data.updated_at,
      creator: data.creator
        ? {
          "@type": "Person",
          name: data.creator.username,
          url: `${BASE_URL}/${data.creator.username}`,
        }
        : undefined,
      numberOfItems: data.project_count,
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
      <PortfolioMain portfolioId={portfolio} viewOnly={true} />
    </>
  );
};

export default PortfolioViewPage;