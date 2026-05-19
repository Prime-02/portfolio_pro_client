"use client";

import { BookOpen } from "lucide-react";
import { BlogGrid } from "./BlogGrid";
import { EmptyBlogsState } from "./EmptyBlogsState";
import { LoadingSkeletonBlogs } from "./LoadingSkeletonBlogs";
import type { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
import { PageHeader } from "../ui/PageHeader";
import { ErrorMessage } from "../ui/ErrorMessage";

interface PublicBlogsViewProps {
  username: string;
  blogs: ContentWithAuthor[];
  totalBlogs: number;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export function PublicBlogsView({
  username,
  blogs,
  totalBlogs,
  isLoading,
  error,
  onClearError,
}: PublicBlogsViewProps) {
  if (isLoading && blogs.length === 0) return <LoadingSkeletonBlogs />;

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        icon={<BookOpen className="w-6 h-6 text-[var(--accent)]" />}
        title={`${username}'s Blog`}
        description={`${totalBlogs} post${totalBlogs !== 1 ? "s" : ""} in their collection`}
      />

      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      {blogs.length === 0 && !isLoading ? (
        <EmptyBlogsState isOwner={false} username={username} />
      ) : (
        <BlogGrid
          blogs={blogs}
          isLoading={isLoading}
          isOwner={false}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}
    </div>
  );
}
