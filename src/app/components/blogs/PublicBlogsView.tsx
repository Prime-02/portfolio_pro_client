"use client";

import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../context/ThemeContext";
import { BlogGrid } from "./BlogGrid";
import { EmptyBlogsState } from "./EmptyBlogsState";
import { LoadingSkeletonBlogs } from "./LoadingSkeletonBlogs";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import type { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
import { PageHeader } from "../ui/PageHeader";
import { ErrorMessage } from "../ui/ErrorMessage";

interface PublicBlogsViewProps {
  username: string;
  blogs: ContentWithAuthor[];
  totalBlogs: number;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  error: string | null;
  onClearError: () => void;
  miniView?: boolean;
}

export function PublicBlogsView({
  username,
  blogs,
  totalBlogs,
  isLoading,
  hasMore,
  onLoadMore,
  error,
  onClearError,
  miniView = false,
}: PublicBlogsViewProps) {
  const router = useRouter();
  const { profileContext } = useTheme();
  const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
  const displayedBlogs = miniView ? blogs.slice(0, 3) : blogs;
  const showSeeAll = miniView && blogs.length > 0;

  if (isLoading && blogs.length === 0) return <LoadingSkeletonBlogs />;

  return (
    <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-7xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-7xl mx-auto"}>
      <PageHeader
        icon={<BookOpen className="w-6 h-6 text-[var(--accent)]" />}
        title={`${username}'s Blog`}
        description={`${totalBlogs} post${totalBlogs !== 1 ? "s" : ""} in their collection`}
      />

      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      {blogs.length === 0 && !isLoading ? (
        <EmptyBlogsState isOwner={false} username={username} />
      ) : (
        <>
          <BlogGrid
            blogs={displayedBlogs}
            isLoading={isLoading && blogs.length === 0}
            isOwner={false}
            onEdit={() => { }}
            onDelete={() => { }}
          />

          {showSeeAll && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => router.push(usernamePath ? `/${usernamePath}/blogs` : `/${username}/blogs`)}
                className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
              >
                See all
              </button>
            </div>
          )}

          {!miniView && (
            <InfiniteScrollTrigger
              hasMore={hasMore}
              isLoading={isLoading}
              onLoadMore={onLoadMore}
            />
          )}
        </>
      )}
    </div>
  );
}