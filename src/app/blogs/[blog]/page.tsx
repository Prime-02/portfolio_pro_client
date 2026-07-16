import React from 'react'
import { BlogDetailPage } from '../../components/blogs'
import type { Metadata } from "next";
import { fetchForMetadata } from "@/lib/server/fetchMetadata";
import { ContentWithAuthor } from '@/lib/stores/contents';

const BASE_URL = "https://portfolio-pro-client.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blog: string }>;
}): Promise<Metadata> {
  const { blog } = await params;
  const post = await fetchForMetadata<ContentWithAuthor>(
    `content/core/public/slug/${blog}`,
  );

  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${BASE_URL}/blogs/${blog}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

const BlogPublicPage = async ({
  params,
}: {
  params: Promise<{ blog: string }>;
}) => {
  const { blog } = await params;
  const post = await fetchForMetadata<ContentWithAuthor>(
    `content/core/public/slug/${blog}`,
  );

  const jsonLd = post
    ? {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      image: post.cover_image_url ? [post.cover_image_url] : undefined,
      datePublished: post.created_at,
      dateModified: post.updated_at,
      author: post.author
        ? {
          "@type": "Person",
          name: `${post.author.firstname ?? ""} ${post.author.lastname ?? ""}`.trim(),
          url: `${BASE_URL}/${post.author.username}`,
        }
        : undefined,
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
      <BlogDetailPage isPublicView />
    </>
  );
};

export default BlogPublicPage;