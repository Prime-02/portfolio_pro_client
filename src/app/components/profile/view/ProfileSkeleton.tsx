// src/app/profile/view/ProfileSkeleton.tsx

interface ProfileSkeletonProps {
    message?: string;
}

export const ProfileSkeleton = ({ message = "Loading profile..." }: ProfileSkeletonProps) => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* ── Loading Message Banner ──────────────────────────────────────── */}
            <div className="card rounded-2xl p-4 sm:p-5 flex items-center gap-3 bg-(--accent)/[0.03] border-(--accent)/10">
                <svg
                    className="w-5 h-5 text-(--accent) animate-spin shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                <p className="text-sm font-league-500 text-(--foreground)/70">{message}</p>
            </div>

            {/* ── Profile Hero Card Skeleton ─────────────────────────────────── */}
            <div className="card rounded-2xl p-6 sm:p-8">
                {/* Top row: Avatar + Edit button */}
                <div className="flex items-start justify-between mb-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-(--foreground)/10" />
                    <div className="w-32 h-10 rounded-xl bg-(--foreground)/10" />
                </div>

                {/* Name & username */}
                <div className="mb-5 space-y-2">
                    <div className="h-8 w-64 bg-(--foreground)/10 rounded-lg" />
                    <div className="h-4 w-32 bg-(--foreground)/10 rounded" />
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <div className="h-7 w-28 bg-(--foreground)/10 rounded-full" />
                    <div className="h-7 w-24 bg-(--foreground)/10 rounded-full" />
                    <div className="h-7 w-20 bg-(--foreground)/10 rounded-full" />
                </div>

                {/* Bio */}
                <div className="mb-6 p-4 rounded-xl bg-(--foreground)/[0.03] border border-(--foreground)/5 space-y-2">
                    <div className="h-3 w-full bg-(--foreground)/10 rounded" />
                    <div className="h-3 w-5/6 bg-(--foreground)/10 rounded" />
                    <div className="h-3 w-4/6 bg-(--foreground)/10 rounded" />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 rounded-xl bg-(--foreground)/[0.03] border border-(--foreground)/5 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-(--foreground)/10 shrink-0" />
                            <div className="flex flex-col gap-1.5 flex-1">
                                <div className="h-4 w-20 bg-(--foreground)/10 rounded" />
                                <div className="h-3 w-14 bg-(--foreground)/10 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Contact & Links Card Skeleton ──────────────────────────────── */}
            <div className="card rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="space-y-1.5 mb-4">
                    <div className="h-5 w-40 bg-(--foreground)/10 rounded" />
                    <div className="h-3 w-56 bg-(--foreground)/10 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="h-3 w-16 bg-(--foreground)/10 rounded" />
                            <div className="h-5 w-full bg-(--foreground)/10 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Preferences Card Skeleton ──────────────────────────────────── */}
            <div className="card rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="space-y-1.5 mb-4">
                    <div className="h-5 w-32 bg-(--foreground)/10 rounded" />
                    <div className="h-3 w-48 bg-(--foreground)/10 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="h-3 w-20 bg-(--foreground)/10 rounded" />
                            <div className="h-5 w-full bg-(--foreground)/10 rounded" />
                        </div>
                    ))}
                </div>

                {/* Color palette skeleton */}
                <div className="pt-4 mt-4 border-t border-(--foreground)/10">
                    <div className="h-3 w-24 bg-(--foreground)/10 rounded mb-4" />
                    <div className="flex flex-wrap gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-(--foreground)/10" />
                                <div className="flex flex-col gap-1">
                                    <div className="h-3 w-20 bg-(--foreground)/10 rounded" />
                                    <div className="h-2.5 w-14 bg-(--foreground)/10 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};