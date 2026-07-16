"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ProfessionalRankingCard from "./components/ProfessionalRankingCard";
import RankingFeedSkeleton from "./components/RankingFeedSkeleton";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";

const PAGE_SIZE = 20;
const SKELETON_COUNT = 5;

export default function ProfessionalsFeedPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const [page, setPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const rankings = useTestimonialsStore((s) => s.rankings);
  const rankingsHasMore = useTestimonialsStore((s) => s.rankingsHasMore);
  const isLoading = useTestimonialsStore((s) => s.rankingsLoading);
  const fetchRankings = useTestimonialsStore((s) => s.fetchRankings);

  // Initial load + reload whenever the "search" query param changes
  useEffect(() => {
    const loadInitial = async () => {
      setIsInitialLoading(true);
      setPage(1);
      await fetchRankings({
        skip: 0,
        limit: PAGE_SIZE,
        search: search || undefined,
        min_testimonials: 1,
      });
      setIsInitialLoading(false);
    };
    loadInitial();
  }, [fetchRankings, search]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && rankingsHasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchRankings({
            skip: (nextPage - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            search: search || undefined,
            min_testimonials: 1,
          });
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [rankingsHasMore, isLoading, page, fetchRankings, search]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Top Professionals
          </h1>
          <p className="text-sm text-[var(--foreground)]/50 max-w-md mx-auto">
            Discover the most recommended professionals in the community, ranked by their average testimonial rating.
          </p>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {isInitialLoading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <RankingFeedSkeleton key={`skeleton-${i}`} />
            ))
          ) : rankings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--accent)]"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="m22 21-3-3" />
                  <path d="m19 18 3 3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                {search ? "No results found" : "No professionals yet"}
              </h3>
              <p className="text-sm text-[var(--foreground)]/50">
                {search
                  ? `Nothing matched "${search}". Try a different search.`
                  : "Be the first to receive a testimonial and appear here!"}
              </p>
            </div>
          ) : (
            rankings.map((user, index) => (
              <ProfessionalRankingCard
                key={user.id}
                user={user}
                rank={(page - 1) * PAGE_SIZE + index + 1}
              />
            ))
          )}

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-4">
            {isLoading && !isInitialLoading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--foreground)]/50">Loading more...</span>
              </div>
            )}
            {!rankingsHasMore && rankings.length > 0 && (
              <p className="text-center text-sm text-[var(--foreground)]/30 py-4">
                You&apos;ve reached the end
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
