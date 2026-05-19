"use client";

export function LoadingSkeletonDetail() {
    return (
        <div className="min-h-screen">
            {/* Sticky header skeleton */}
            <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--foreground)]/5">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="h-5 w-16 rounded bg-[var(--foreground)]/10 animate-pulse" />
                    <div className="flex gap-2">
                        <div className="h-8 w-28 rounded-lg bg-[var(--foreground)]/10 animate-pulse" />
                        <div className="h-8 w-20 rounded-lg bg-[var(--foreground)]/10 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Hero media skeleton */}
                <div className="rounded-2xl overflow-hidden border border-[var(--foreground)]/10">
                    <div className="aspect-video bg-[var(--foreground)]/5 animate-pulse" />
                </div>

                {/* Title & actions row skeleton */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-9 w-64 rounded-lg bg-[var(--foreground)]/10 animate-pulse" />
                            <div className="h-6 w-24 rounded-full bg-[var(--foreground)]/5 animate-pulse" />
                        </div>
                        <div className="h-4 w-40 rounded bg-[var(--foreground)]/5 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 w-24 rounded-xl bg-[var(--foreground)]/5 animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Description skeleton */}
                <div className="mt-6 space-y-2">
                    <div className="h-4 w-full rounded bg-[var(--foreground)]/5 animate-pulse" />
                    <div className="h-4 w-3/4 rounded bg-[var(--foreground)]/5 animate-pulse" />
                </div>

                {/* Tabs skeleton */}
                <div className="flex gap-1 mt-8 mb-6 p-1 rounded-xl bg-[var(--foreground)]/5 w-fit">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-9 w-28 rounded-lg bg-[var(--foreground)]/5 animate-pulse" />
                    ))}
                </div>

                {/* Tab content skeleton - Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-24 rounded-xl bg-[var(--foreground)]/5 animate-pulse" />
                    ))}
                </div>

                {/* Stack section skeleton */}
                <div className="mt-8">
                    <div className="h-4 w-24 rounded bg-[var(--foreground)]/10 animate-pulse mb-3" />
                    <div className="flex flex-wrap gap-2">
                        {[56, 72, 48, 64, 80, 52].map((w, i) => (
                            <div key={i} className="h-8 rounded-lg bg-[var(--foreground)]/5 animate-pulse" style={{ width: `${w}px` }} />
                        ))}
                    </div>
                </div>

                {/* Tags section skeleton */}
                <div className="mt-6">
                    <div className="h-4 w-16 rounded bg-[var(--foreground)]/10 animate-pulse mb-3" />
                    <div className="flex flex-wrap gap-2">
                        {[48, 60, 44, 56, 40].map((w, i) => (
                            <div key={i} className="h-7 rounded-full bg-[var(--foreground)]/5 animate-pulse" style={{ width: `${w}px` }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}