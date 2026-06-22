"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Plus, Share2 } from "lucide-react";
import { BlogStatsBar } from "./BlogStatsBar";
import { BlogFilters } from "./BlogFilters";
import { BlogGrid } from "./BlogGrid";
import { EmptyBlogsState } from "./EmptyBlogsState";
import { LoadingSkeletonBlogs } from "./LoadingSkeletonBlogs";
import { DeleteBlogDialog } from "./DeleteBlogDialog";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import type { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
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
  };
  onFilterChange: (params: OwnBlogsViewProps["filterParams"]) => void;
  onDelete: (contentIds: string[]) => Promise<void>;
  deleting: boolean;
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
}: OwnBlogsViewProps) {
  const router = useRouter();
  const { userInfo } = useUserSettings();
  const [deleteBlog, setDeleteBlog] = useState<ContentWithAuthor | null>(null);

  const handleEdit = (blog: ContentWithAuthor) => {
    router.push(`/${userInfo?.username || "users"}/blogs/${blog.id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBlog) return;
    await onDelete([deleteBlog.id]);
    setDeleteBlog(null);
  };

  if (isLoading && blogs.length === 0) return <LoadingSkeletonBlogs />;

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        icon={<PenLine className="w-6 h-6 text-[var(--accent)]" />}
        title="My Posts & Blogs"
        description={`${totalBlogs} post${totalBlogs !== 1 ? "s" : ""} in your collection`}
        action={
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
        }
      />

      <BlogStatsBar blogs={blogs} />

      <BlogFilters
        query={filterParams.query}
        onQueryChange={(query) => onFilterChange({ ...filterParams, query })}
        status={filterParams.status}
        onStatusChange={(status) => onFilterChange({ ...filterParams, status })}
        sort={filterParams.sort}
        onSortChange={(sort) => onFilterChange({ ...filterParams, sort })}
        sortDirection={filterParams.sortDirection}
        onSortDirectionChange={(sortDirection) =>
          onFilterChange({ ...filterParams, sortDirection })
        }
      />

      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      {blogs.length === 0 && !isLoading ? (
        <EmptyBlogsState isOwner={true} />
      ) : (
        <>
          <BlogGrid
            blogs={blogs}
            isLoading={isLoading && blogs.length === 0}
            isOwner={true}
            onEdit={handleEdit}
            onDelete={setDeleteBlog}
          />

          <InfiniteScrollTrigger
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={onLoadMore}
          />
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