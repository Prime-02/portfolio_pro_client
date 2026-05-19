// components/skills/LoadingSkeleton.tsx
"use client";

export function LoadingSkeleton() {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-[var(--foreground)]/10 p-4 animate-pulse"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--foreground)]/10" />
                        <div className="flex-1">
                            <div className="h-3.5 w-24 rounded bg-[var(--foreground)]/10 mb-2" />
                            <div className="h-2.5 w-16 rounded bg-[var(--foreground)]/5" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/5" />
                    </div>
                    <div className="h-2 w-full rounded bg-[var(--foreground)]/5 mt-3" />
                    <div className="flex gap-1.5 mt-3">
                        <div className="h-5 w-16 rounded-md bg-[var(--foreground)]/5" />
                        <div className="h-5 w-14 rounded-md bg-[var(--foreground)]/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}