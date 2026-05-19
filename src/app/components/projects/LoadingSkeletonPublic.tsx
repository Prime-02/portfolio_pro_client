"use client";
export function LoadingSkeletonPublic() {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
            {/* Header skeleton - no action button */}
            <div className="mb-10 flex items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/10 animate-pulse" />
                    <div className="h-8 w-56 rounded-lg bg-[var(--foreground)]/10 animate-pulse" />
                </div>
            </div>

            {/* Stats bar skeleton - simplified for public */}
            <div className="flex gap-3 mb-8 flex-wrap">
                {[80, 96, 72].map((w, i) => (
                    <div
                        key={i}
                        className="h-9 rounded-lg bg-[var(--foreground)]/5 animate-pulse"
                        style={{ width: `${w}px` }}
                    />
                ))}
            </div>

            {/* Bento grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Featured large card */}
                <div className="md:col-span-2 lg:col-span-2 h-80 rounded-2xl bg-[var(--foreground)]/5 animate-pulse" />
                {/* Regular cards */}
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-64 rounded-2xl bg-[var(--foreground)]/5 animate-pulse"
                    />
                ))}
            </div>
        </div>
    );
}