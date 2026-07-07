"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeContext";
import { PenLine, Plus, Share2 } from "lucide-react";
import { BlogStatsBar } from "./BlogStatsBar";
import { BlogFilters } from "./BlogFilters";
import { BlogGrid } from "./BlogGrid";
import { EmptyBlogsState } from "./EmptyBlogsState";
import { LoadingSkeletonBlogs } from "./LoadingSkeletonBlogs";
import { DeleteBlogDialog } from "./DeleteBlogDialog";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import type { ContentType, ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
import { PageHeader } from "../ui/PageHeader";
import Button from "../buttons/Buttons";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";

interface OwnBlogsViewProps {
  blogs: ContentWithAuthor[];
  totalBlogs: number;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  error: string | null;
  onClearError: () => void;
  filterParams: {
    query: string;
    status: "" | "PUBLISHED" | "DRAFT" | "ARCHIVED";
    sort: "date" | "name" | "views" | "likes";
    sortDirection: "asc" | "desc";
    type: ContentType
  };
  onFilterChange: (params: OwnBlogsViewProps["filterParams"]) => void;
  onDelete: (contentIds: string[]) => Promise<void>;
  deleting: boolean;
  miniView?: boolean;
}

export function OwnBlogsView({
  blogs,
  totalBlogs,
  isLoading,
  hasMore,
  onLoadMore,
  error,
  onClearError,
  filterParams,
  onFilterChange,
  onDelete,
  deleting,
  miniView = false,
}: OwnBlogsViewProps) {
  const router = useRouter();
  const { profileContext } = useTheme();
  const { userInfo } = useUserSettings();
  const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
  const [deleteBlog, setDeleteBlog] = useState<ContentWithAuthor | null>(null);

  const handleEdit = (blog: ContentWithAuthor) => {
    router.push(`/${userInfo?.username || "users"}/blogs/${blog.id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBlog) return;
    await onDelete([deleteBlog.id]);
    setDeleteBlog(null);
  };

  const displayedBlogs = miniView ? blogs.slice(0, 3) : blogs;
  const showSeeAll = miniView && blogs.length > 0;

  if (isLoading && blogs.length === 0) return <LoadingSkeletonBlogs />;

  return (
    <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-7xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-7xl mx-auto"}>
      <PageHeader
        icon={<PenLine className="w-6 h-6 text-[var(--accent)]" />}
        title="My Posts & Blogs"
        description={`${totalBlogs} post${totalBlogs !== 1 ? "s" : ""} in your collection`}
        action={!miniView ? (
          <div className="flex items-center gap-x-2">
            <Button
              onClick={handleShareProfile}
              className="self-start sm:self-auto"
              text="Share Your Posts"
              variant="outline"
              icon={<Share2 className="w-4 h-4" />}
            />
            <Button
              onClick={() =>
                router.push(`/${userInfo?.username || "users"}/blogs/create`)
              }
              className="self-start sm:self-auto"
              text="New Post"
              icon={<Plus className="w-4 h-4" />}
            />
          </div>
        ) : undefined}
      />

      {
        !miniView &&
        <BlogStatsBar blogs={blogs} />
      }

      {
        !miniView &&
        <BlogFilters
          query={filterParams.query}
          onQueryChange={(query) => onFilterChange({ ...filterParams, query })}
          status={filterParams.status}
          onStatusChange={(status) => onFilterChange({ ...filterParams, status })}
          type={filterParams.type}
          onTypeChange={(type) => onFilterChange({ ...filterParams, type })}
          sort={filterParams.sort}
          onSortChange={(sort) => onFilterChange({ ...filterParams, sort })}
          sortDirection={filterParams.sortDirection}
          onSortDirectionChange={(sortDirection) =>
            onFilterChange({ ...filterParams, sortDirection })
          }
        />
      }


      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      {blogs.length === 0 && !isLoading ? (
        <EmptyBlogsState isOwner={true} />
      ) : (
        <>
          <BlogGrid
            blogs={displayedBlogs}
            isLoading={isLoading && blogs.length === 0}
            isOwner={true}
            onEdit={handleEdit}
            onDelete={setDeleteBlog}
          />

          {showSeeAll && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => router.push(usernamePath ? `/${usernamePath}/blogs` : `/${userInfo?.username || "users"}/blogs`)}
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

      <DeleteBlogDialog
        blogTitle={deleteBlog?.title ?? ""}
        open={!!deleteBlog}
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => !open && setDeleteBlog(null)}
      />
    </div>
  );
}