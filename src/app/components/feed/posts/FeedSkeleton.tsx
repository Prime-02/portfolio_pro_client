"use client";

import React from "react";

export default function FeedSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[var(--foreground)]/10 p-5 animate-pulse"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Author Header Skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 rounded bg-[var(--foreground)]/10" />
          <div className="h-2.5 w-20 rounded bg-[var(--foreground)]/5" />
        </div>
      </div>

      {/* Content Body Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded bg-[var(--foreground)]/10" />
        <div className="h-3 w-5/6 rounded bg-[var(--foreground)]/10" />
        <div className="h-3 w-4/6 rounded bg-[var(--foreground)]/10" />
      </div>

      {/* Image Skeleton */}
      <div className="h-48 w-full rounded-xl bg-[var(--foreground)]/5 mb-4" />

      {/* Stats Bar Skeleton */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="h-2.5 w-16 rounded bg-[var(--foreground)]/5" />
        <div className="h-2.5 w-16 rounded bg-[var(--foreground)]/5" />
      </div>

      {/* Interaction Bar Skeleton */}
      <div className="flex items-center gap-1 pt-3 border-t border-[var(--foreground)]/10">
        <div className="flex-1 h-9 rounded-xl bg-[var(--foreground)]/5" />
        <div className="flex-1 h-9 rounded-xl bg-[var(--foreground)]/5" />
      </div>
    </div>
  );
}
