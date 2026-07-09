"use client";

import React from "react";

export default function SuggestionSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[var(--foreground)]/10 p-5 animate-pulse"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar Skeleton */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--foreground)]/10" />

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-24 rounded bg-[var(--foreground)]/10" />
            <div className="h-3 w-16 rounded bg-[var(--foreground)]/5" />
          </div>
          <div className="h-4 w-3/4 rounded bg-[var(--foreground)]/10" />
          <div className="h-3 w-full rounded bg-[var(--foreground)]/5" />
          <div className="h-3 w-2/3 rounded bg-[var(--foreground)]/5" />
          <div className="flex items-center gap-2 pt-1">
            <div className="h-7 w-16 rounded-full bg-[var(--foreground)]/5" />
            <div className="h-7 w-20 rounded-full bg-[var(--foreground)]/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
