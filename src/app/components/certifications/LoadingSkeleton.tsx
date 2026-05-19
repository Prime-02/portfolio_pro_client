// components/certifications/LoadingSkeleton.tsx
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
                        <div className="flex-1">
                            <div className="h-4 w-32 rounded bg-[var(--foreground)]/10 mb-2" />
                            <div className="h-3 w-24 rounded bg-[var(--foreground)]/5" />
                        </div>
                    </div>
                    <div className="h-3 w-full rounded bg-[var(--foreground)]/5 mb-2" />
                    <div className="h-3 w-2/3 rounded bg-[var(--foreground)]/5 mb-4" />
                    <div className="flex gap-2">
                        <div className="h-6 w-20 rounded-full bg-[var(--foreground)]/5" />
                        <div className="h-6 w-20 rounded-full bg-[var(--foreground)]/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}