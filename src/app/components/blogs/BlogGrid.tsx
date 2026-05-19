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
  // Sort: pinned first, then featured, then by date
  const sorted = useMemo(() => {
    return [...blogs].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [blogs]);
  
  if (isLoading) return null;


  // First pinned or featured with cover as featured card
  const featuredBlog = sorted.find((b) => (b.is_pinned || b.is_featured) && b.cover_image_url);
  const regularBlogs = sorted.filter((b) => b.id !== featuredBlog?.id);

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
