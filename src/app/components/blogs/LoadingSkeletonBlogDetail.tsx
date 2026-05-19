"use client";

export function LoadingSkeletonBlogDetail() {
  return (
    <div className="min-h-screen">
      {/* Sticky header skeleton */}
      <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--foreground)]/5">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="h-5 w-16 rounded bg-[var(--foreground)]/10 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-28 rounded-lg bg-[var(--foreground)]/10 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-[var(--foreground)]/10 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Cover image skeleton */}
        <div className="rounded-2xl overflow-hidden border border-[var(--foreground)]/10">
          <div className="aspect-[21/9] bg-[var(--foreground)]/5 animate-pulse" />
        </div>

        {/* Title & meta row skeleton */}
        <div className="mt-8">
          <div className="h-10 w-3/4 rounded-lg bg-[var(--foreground)]/10 animate-pulse mb-3" />
          <div className="flex gap-3">
            <div className="h-5 w-32 rounded bg-[var(--foreground)]/5 animate-pulse" />
            <div className="h-5 w-24 rounded bg-[var(--foreground)]/5 animate-pulse" />
            <div className="h-5 w-20 rounded bg-[var(--foreground)]/5 animate-pulse" />
          </div>
        </div>

        {/* Engagement actions skeleton */}
        <div className="flex items-center gap-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-28 rounded-xl bg-[var(--foreground)]/5 animate-pulse" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full rounded bg-[var(--foreground)]/5 animate-pulse" />
          <div className="h-4 w-full rounded bg-[var(--foreground)]/5 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-[var(--foreground)]/5 animate-pulse" />
          <div className="h-4 w-full rounded bg-[var(--foreground)]/5 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-[var(--foreground)]/5 animate-pulse" />
          <div className="h-4 w-full rounded bg-[var(--foreground)]/5 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-[var(--foreground)]/5 animate-pulse" />
        </div>

        {/* Tags skeleton */}
        <div className="mt-8">
          <div className="h-4 w-16 rounded bg-[var(--foreground)]/10 animate-pulse mb-3" />
          <div className="flex flex-wrap gap-2">
            {[56, 72, 48, 64, 80, 52].map((w, i) => (
              <div key={i} className="h-7 rounded-full bg-[var(--foreground)]/5 animate-pulse" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>

        {/* Engagement section skeleton */}
        <div className="mt-12 space-y-4">
          <div className="h-6 w-32 rounded bg-[var(--foreground)]/10 animate-pulse" />
          <div className="h-24 rounded-xl bg-[var(--foreground)]/5 animate-pulse" />
          <div className="h-24 rounded-xl bg-[var(--foreground)]/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
