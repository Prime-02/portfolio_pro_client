// components/testimonials/LoadingSkeleton.tsx
"use client";

export function LoadingSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-[var(--foreground)]/10 p-6 animate-pulse"
                >
                    <div className="w-8 h-8 rounded bg-[var(--foreground)]/10 mb-3" />
                    <div className="h-3 w-full rounded bg-[var(--foreground)]/5 mb-2" />
                    <div className="h-3 w-4/5 rounded bg-[var(--foreground)]/5 mb-2" />
                    <div className="h-3 w-2/3 rounded bg-[var(--foreground)]/5 mb-6" />
                    <div className="flex items-center gap-3 pt-4 border-t border-[var(--foreground)]/5">
                        <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10" />
                        <div className="flex-1">
                            <div className="h-3 w-24 rounded bg-[var(--foreground)]/10 mb-2" />
                            <div className="h-2.5 w-16 rounded bg-[var(--foreground)]/5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}