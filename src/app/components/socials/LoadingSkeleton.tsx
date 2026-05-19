// components/social/LoadingSkeleton.tsx
"use client";

export function LoadingSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-[var(--foreground)]/10 p-5 animate-pulse"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/10" />
                        <div>
                            <div className="h-4 w-20 rounded bg-[var(--foreground)]/10 mb-2" />
                            <div className="h-3 w-12 rounded bg-[var(--foreground)]/5" />
                        </div>
                    </div>
                    <div className="h-12 rounded-xl bg-[var(--foreground)]/5 mb-3" />
                    <div className="h-4 w-3/4 rounded bg-[var(--foreground)]/5" />
                </div>
            ))}
        </div>
    );
}