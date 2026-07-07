"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import CreatePostBar from "./CreatePostBar";
import FeedSkeleton from "./FeedSkeleton";
import FeedCard from "./feed_card_components/FeedCard";

const PAGE_SIZE = 10;
const SKELETON_COUNT = 3;

export default function FYPPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const [page, setPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const publicItems = useContentStore((s) => s.publicItems);
  const publicHasNext = useContentStore((s) => s.publicHasNext);
  const isLoading = useContentStore((s) => s.isLoading);
  const fetchPublicContent = useContentStore((s) => s.fetchPublicContent);

  // Initial load + reload whenever the "search" query param changes
  useEffect(() => {
    const loadInitial = async () => {
      setIsInitialLoading(true);
      setPage(1);
      await fetchPublicContent({
        page: 1,
        page_size: PAGE_SIZE,
        sort_by: "created_at",
        sort_order: "desc",
        search,
      });
      setIsInitialLoading(false);
    };
    loadInitial();
  }, [fetchPublicContent, search]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && publicHasNext && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPublicContent({
            page: nextPage,
            page_size: PAGE_SIZE,
            sort_by: "created_at",
            sort_order: "desc",
            search,
          });
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [publicHasNext, isLoading, page, fetchPublicContent, search]);

  // Refresh feed after new post
  const handlePostCreated = useCallback(() => {
    setPage(1);
    fetchPublicContent({
      page: 1,
      page_size: PAGE_SIZE,
      sort_by: "created_at",
      sort_order: "desc",
      search,
    });
  }, [fetchPublicContent, search]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create Post Bar */}
        <CreatePostBar onPostCreated={handlePostCreated} />

        {/* Feed */}
        <div className="space-y-6">
          {isInitialLoading ? (
            // Skeleton loading state
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <FeedSkeleton key={`skeleton-${i}`} />
            ))
          ) : publicItems.length === 0 ? (
            // Empty state
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[var(--accent)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                {search ? "No results found" : "No posts yet"}
              </h3>
              <p className="text-sm text-[var(--foreground)]/50">
                {search
                  ? `Nothing matched "${search}". Try a different search.`
                  : "Be the first to share something with the community!"}
              </p>
            </div>
          ) : (
            // Feed items - only render POST and BLOG types
            publicItems
              .filter(
                (item) => item.content_type === "POST" || item.content_type === "BLOG"
              )
              .map((content) => <FeedCard key={content.id} content={content} />)
          )}

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-4">
            {isLoading && !isInitialLoading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--foreground)]/50">Loading more...</span>
              </div>
            )}
            {!publicHasNext && publicItems.length > 0 && (
              <p className="text-center text-sm text-[var(--foreground)]/30 py-4">
               {` You've reached the end`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}