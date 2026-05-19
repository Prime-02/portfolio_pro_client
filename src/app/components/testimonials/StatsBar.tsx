// components/testimonials/StatsBar.tsx
import { TestimonialStats } from "@/lib/stores/testimonials/useTestimonial";
import { Quote, Star, Users, CheckCircle2 } from "lucide-react";

interface StatsBarProps {
    stats?: TestimonialStats;
    totalCount?: number;
    className?: string;
}

export function StatsBar({ stats, totalCount, className = "" }: StatsBarProps) {
    if (!stats && !totalCount) return null;

    const count = stats?.total_testimonials ?? totalCount ?? 0;
    const hasRating = stats?.testimonials_with_rating ?? 0;
    const avgRating = stats?.average_rating;

    return (
        <div className={`flex gap-4 mb-8 flex-wrap ${className}`}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Quote className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {count} {count === 1 ? "testimonial" : "testimonials"}
                </span>
            </div>
            {hasRating > 0 && avgRating && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium">
                        {avgRating.toFixed(1)} avg rating
                    </span>
                </div>
            )}
            {hasRating > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                    <Users className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-sm font-medium">
                        {hasRating} rated
                    </span>
                </div>
            )}
        </div>
    );
}