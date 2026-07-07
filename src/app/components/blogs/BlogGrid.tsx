"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BlogCard } from "./BlogCard";
import type { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";

interface BlogGridProps {
  blogs: ContentWithAuthor[];
  isLoading: boolean;
  isOwner: boolean;
  onEdit: (blog: ContentWithAuthor) => void;
  onDelete: (blog: ContentWithAuthor) => void;
}

export function BlogGrid({ blogs, isLoading, isOwner, onEdit, onDelete }: BlogGridProps) {
  // Order comes from the API (sort_by / sort_order). We don't re-sort here —
  // we only pull one pinned/featured post out to render as the hero card.
  const featuredBlog = useMemo(
    () => blogs.find((b) => (b.is_pinned || b.is_featured) && b.cover_image_url),
    [blogs]
  );

  const regularBlogs = useMemo(
    () => blogs.filter((b) => b.id !== featuredBlog?.id),
    [blogs, featuredBlog]
  );

  if (isLoading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
      <AnimatePresence mode="popLayout">
        {featuredBlog && (
          <BlogCard
            key={featuredBlog.id}
            blog={featuredBlog}
            index={0}
            isOwner={isOwner}
            featured={true}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}

        {regularBlogs.map((blog, idx) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            index={idx + 1}
            isOwner={isOwner}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}