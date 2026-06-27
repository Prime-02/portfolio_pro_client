// portfolio-builder/components/sections/blogs/BlogsSectionController.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import BlogsRenderer from "./BlogsRenderer";
import BlogsEditor from "./BlogsEditor";
import { BlogsData, getEmptyBlogsData } from "@/portfolio-builder/types/blogs";
import { useContentStore } from "@/lib/stores/contents/useContentStore";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BlogsSectionControllerProps {
  blogsData: BlogsData | null;
  onSave: (updatedBlogsData: BlogsData) => Promise<void>;
  username: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BlogsSectionController({
  blogsData,
  onSave,
  username,
}: BlogsSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { fetchPublicContent } = useContentStore();

  // ── Optimistic local state ────────────────────────────────────────────────
  const [localData, setLocalData] = useState<BlogsData | null>(blogsData);
  useEffect(() => {
    if (blogsData) setLocalData(blogsData);
  }, [blogsData]);

  // Prefetch with the real filter config as soon as both username and
  // blogsData are available.
  const prefetchedRef = useRef(false);
  useEffect(() => {
    if (!username || !blogsData || prefetchedRef.current) return;
    prefetchedRef.current = true;
    fetchPublicContent({
      username,
      content_type: blogsData.filters?.content_type,
      status: blogsData.filters?.status,
      category: blogsData.filters?.category,
      tags: blogsData.filters?.tags,
      is_public: blogsData.filters?.is_public,
      is_featured: blogsData.filters?.is_featured,
      search: blogsData.filters?.search,
      date_from: blogsData.filters?.date_from,
      date_to: blogsData.filters?.date_to,
      ids: blogsData.filters?.ids,
      merge_filters: blogsData.filters?.merge_filters,
      page_size: 50,
    });
  }, [username, blogsData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Save ----------------------------------------------------------------
  const handleSave = async (updatedBlogsData: BlogsData) => {
    setLocalData(updatedBlogsData);
    await onSave(updatedBlogsData);
  };

  // ---- Cancel --------------------------------------------------------------
  const handleCancel = () => {
    setLocalData(blogsData);
    setIsEditing(false);
  };

  // ---- Fullscreen ----------------------------------------------------------
  const handleSetFullscreen = (latestData: BlogsData) => {
    setLocalData(latestData);
    setIsEditing(false);
  };

  // ---- No blogs data, not editing — show placeholder -----------------------
  if (!localData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Blogs section not set up</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Blogs Section
          </button>
        </div>
      </div>
    );
  }

  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <BlogsEditor
        initialData={localData || getEmptyBlogsData()}
        onSave={handleSave}
        onCancel={handleCancel}
        setFullScreen={handleSetFullscreen}
        username={username}
      />
    );
  }

  // ---- Viewing — show renderer ---------------------------------------------
  return (
    <div className="relative">
      <BlogsRenderer data={localData!} username={username} />

      {/* Edit button */}
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors"
      >
        Edit
      </button>
    </div>
  );
}
