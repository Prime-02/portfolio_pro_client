"use client";

import { useEffect, useState, useCallback } from "react";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import { LoadingSkeletonBlogs } from "./LoadingSkeletonBlogs";
import { OwnBlogsView } from "./OwnBlogsView";
import { PublicBlogsView } from "./PublicBlogsView";
import { useTheme } from "../../../context/ThemeContext";
import { ContentType } from "@/lib/stores/contents";

const PAGE_SIZE = 10;

export default function BlogsPage({ miniView = false }: { miniView?: boolean }) {
  const {
    items,
    total,
    page,
    has_next,
    isLoading,
    error,
    fetchContent,
    deleteContent,
    publicItems,
    publicHasNext,
    publicPage,
    publicTotal,
    fetchPublicUserContent,
  } = useContentStore();

  // Get profile context from ThemeContext instead of re-validating
  const { profileContext } = useTheme();

  const [pageError, setPageError] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState({
    query: "",
    status: "" as "" | "PUBLISHED" | "DRAFT" | "ARCHIVED",
    sort: "date" as "date" | "name" | "views" | "likes",
    type: "" as ContentType,
    sortDirection: "desc" as "asc" | "desc",
  });

  // Derived state from profileContext
  const isOwnProfile = profileContext.kind === "own";
  const publicUsername = profileContext.kind === "public" ? profileContext.username : null;

  // ---------- initial / filter-driven fetch (always page 1) ----------
  useEffect(() => {
    if (profileContext.kind === "pending" || profileContext.kind === "unauthenticated" || profileContext.kind === "not-found") {
      return;
    }

    const fetchData = async () => {
      if (profileContext.kind === "public") {
        await fetchPublicUserContent(profileContext.username, {
          status: "PUBLISHED",
          page: 1,
          page_size: PAGE_SIZE,
        });
      } else if (profileContext.kind === "own") {
        await fetchContent({
          search: filterParams.query || undefined,
          status: filterParams.status || undefined,
          content_type: filterParams.type || undefined,
          sort_by: filterParams.sort === "date" ? "created_at" : filterParams.sort,
          sort_order: filterParams.sortDirection,
          page: 1,
          page_size: PAGE_SIZE,
        });
      }
    };

    fetchData();
  }, [
    profileContext.kind,
    publicUsername,
    filterParams.query,
    filterParams.status,
    filterParams.type,
    filterParams.sort,
    filterParams.sortDirection,
  ]);

  // ---------- store error ----------
  useEffect(() => {
    if (error) setPageError(error);
  }, [error]);

  // ---------- load-more handlers ----------
  const handleLoadMoreOwn = useCallback(async () => {
    if (!has_next || isLoading) return;
    const nextPage = page + 1;
    await fetchContent({
      search: filterParams.query || undefined,
      status: filterParams.status || undefined,
      content_type: filterParams.type || undefined,
      sort_by: filterParams.sort === "date" ? "created_at" : filterParams.sort,
      sort_order: filterParams.sortDirection,
      page: nextPage,
      page_size: PAGE_SIZE,
    });
  }, [has_next, isLoading, page, filterParams, fetchContent]);

  const handleLoadMorePublic = useCallback(async () => {
    if (!publicHasNext || isLoading || !publicUsername) return;
    const nextPage = publicPage + 1;
    await fetchPublicUserContent(publicUsername, {
      status: "PUBLISHED",
      page: nextPage,
      page_size: PAGE_SIZE,
    });
  }, [publicHasNext, isLoading, publicPage, publicUsername, fetchPublicUserContent]);

  // ---------- delete ----------
  const handleDelete = async (contentIds: string[]) => {
    for (const id of contentIds) {
      await deleteContent(id, true);
    }
  };

  // ---------- render ----------
  if (profileContext.kind === "pending") return <LoadingSkeletonBlogs />;

  if (profileContext.kind === "not-found" || profileContext.kind === "unauthenticated") {
    return (
      <div className="p-10 text-center text-[var(--foreground)]/50">
        Profile not found
      </div>
    );
  }

  if (publicUsername) {
    return (
      <PublicBlogsView
        username={publicUsername}
        blogs={publicItems}
        miniView={miniView}
        totalBlogs={publicTotal}
        isLoading={isLoading}
        hasMore={publicHasNext}
        onLoadMore={handleLoadMorePublic}
        error={pageError}
        onClearError={() => setPageError(null)}
      />
    );
  }

  return (
    <OwnBlogsView
      blogs={items}
      miniView={miniView}
      totalBlogs={total}
      isLoading={isLoading}
      hasMore={has_next}
      onLoadMore={handleLoadMoreOwn}
      error={pageError}
      onClearError={() => setPageError(null)}
      filterParams={filterParams}
      onFilterChange={setFilterParams}
      onDelete={handleDelete}
      deleting={isLoading}
    />
  );
}