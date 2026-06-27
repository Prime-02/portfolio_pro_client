// portfolio-builder/components/sections/blogs/renderer-components/FeaturedCarouselLayout.tsx

import { useState } from "react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import BlogCard from "./BlogCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const COL_CLASS: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function FeaturedCarouselLayout({ blogs, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
    const [currentPage, setCurrentPage] = useState(0);

    const itemsPerPage = Math.min(Math.max(data.columns, 1), 4);
    const totalPages = Math.ceil(blogs.length / itemsPerPage);
    const colClass = COL_CLASS[itemsPerPage] ?? "grid-cols-2";
    const gapClass = GAP_CLASS[data.gap];

    const next = () => setCurrentPage((p) => (p + 1) % totalPages);
    const prev = () => setCurrentPage((p) => (p - 1 + totalPages) % totalPages);
    const goTo = (i: number) => setCurrentPage(i);

    const pageBlogs = blogs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const defaults = {
        style: data.cardStyle,
        showImage: data.showImage,
        showTitle: data.showTitle,
        showExcerpt: data.showExcerpt,
        showBody: data.showBody,
        showAuthor: data.showAuthor,
        showDates: data.showDates,
        showStatus: data.showStatus,
        showTags: data.showTags,
        showCategory: data.showCategory,
        showReactions: data.showReactions,
        showComments: data.showComments,
        showViews: data.showViews,
        showReadTime: data.showReadTime,
        showShare: data.showShare,
        showBookmark: data.showBookmark,
        showUrl: data.showUrl,
        dateDisplay: data.dateDisplay,
        statusDisplay: data.statusDisplay,
        reactionDisplay: data.reactionDisplay,
    } as const;

    return (
        <div className="space-y-5">
            {/* Featured hero card */}
            {blogs[0] && (
                <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                    <BlogCard
                        blog={blogs[0]}
                        config={resolveCardOverride(blogs[0], data.cardOverrides, { ...defaults, style: "featured" })}
                        cardSize="large"
                        fullWidth={true}
                    />
                </MotionItem>
            )}

            {/* Card grid */}
            <div className={`grid ${colClass} ${gapClass}`}>
                {pageBlogs.map((blog, index) => (
                    <MotionItem
                        key={blog.id || index}
                        isAnimated={isAnimated}
                        shouldAnimate={shouldAnimate}
                        anim={anim}
                    >
                        <BlogCard
                            blog={blog}
                            config={resolveCardOverride(blog, data.cardOverrides, defaults)}
                            cardSize={data.cardSize}
                        />
                    </MotionItem>
                ))}
            </div>

            {/* Navigation */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={prev}
                        className="p-2 rounded-lg border border-[var(--pb-border)] hover:bg-[var(--pb-surface-hover)] transition-colors"
                        aria-label="Previous page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                aria-label={`Go to page ${i + 1}`}
                                className={`rounded-full transition-all duration-200 ${i === currentPage ? "w-5 h-2 bg-[var(--pb-foreground)]" : "w-2 h-2 bg-[var(--pb-border)] hover:bg-[var(--pb-foreground-20)]"}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={next}
                        className="p-2 rounded-lg border border-[var(--pb-border)] hover:bg-[var(--pb-surface-hover)] transition-colors"
                        aria-label="Next page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
