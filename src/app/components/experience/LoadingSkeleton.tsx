// components/experience/LoadingSkeleton.tsx
"use client";

export function LoadingSkeleton() {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-4xl mx-auto">
            {/* Header skeleton */}
            <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/10 animate-pulse" />
                    <div className="h-8 w-48 rounded-lg bg-[var(--foreground)]/10 animate-pulse" />
                </div>
                <div className="h-9 w-32 rounded-lg bg-[var(--foreground)]/10 animate-pulse" />
            </div>

            {/* Stats bar skeleton */}
            <div className="flex gap-3 mb-8">
                {[80, 96, 72, 88].map((w, i) => (
                    <div
                        key={i}
                        className="h-9 rounded-lg bg-[var(--foreground)]/5 animate-pulse"
                        style={{ width: `${w}px` }}
                    />
                ))}
            </div>

            {/* Timeline skeleton */}
            <div className="relative">
                {/* vertical line */}
                <div className="absolute left-5 top-6 bottom-0 w-px bg-[var(--foreground)]/10" />

                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-5 animate-pulse">
                            {/* dot */}
                            <div className="relative z-10 flex-shrink-0 mt-1">
                                <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10" />
                            </div>

                            {/* card */}
                            <div className="flex-1 rounded-2xl border border-[var(--foreground)]/10 p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="h-5 w-40 rounded bg-[var(--foreground)]/10 mb-2" />
                                        <div className="h-3.5 w-28 rounded bg-[var(--foreground)]/8" />
                                    </div>
                                    <div className="h-6 w-20 rounded-full bg-[var(--foreground)]/5" />
                                </div>
                                <div className="h-3 w-32 rounded bg-[var(--foreground)]/5 mb-4" />
                                <div className="space-y-1.5">
                                    <div className="h-2.5 w-full rounded bg-[var(--foreground)]/5" />
                                    <div className="h-2.5 w-4/5 rounded bg-[var(--foreground)]/5" />
                                </div>
                                <div className="flex gap-1.5 mt-4">
                                    {[48, 56, 44].map((w, j) => (
                                        <div key={j} className="h-5 rounded-md bg-[var(--foreground)]/5" style={{ width: `${w}px` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
