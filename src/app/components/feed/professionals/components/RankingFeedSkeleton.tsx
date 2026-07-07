"use client";

import React from "react";

export default function RankingFeedSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[var(--foreground)]/10 p-5 animate-pulse"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="flex items-start gap-4">
        {/* Rank Badge Skeleton */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--foreground)]/10" />

        {/* Avatar Skeleton */}
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--foreground)]/10" />

        {/* Info Skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-40 rounded bg-[var(--foreground)]/10" />
          <div className="h-3 w-28 rounded bg-[var(--foreground)]/5" />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-3 w-20 rounded bg-[var(--foreground)]/5" />
            <div className="h-3 w-24 rounded bg-[var(--foreground)]/5" />
          </div>
        </div>

        {/* Expand Toggle Skeleton */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--foreground)]/5" />
      </div>
    </div>
  );
}
