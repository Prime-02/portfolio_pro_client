// portfolio-builder/components/sections/blogs/renderer-components/TimelineLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import BlogCard from "./BlogCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-4", medium: "gap-6", large: "gap-8" } as const;

export default function TimelineLayout({ blogs, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
    const gapClass = GAP_CLASS[data.gap];

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

    // Group by month/year for timeline markers
    const grouped = blogs.reduce((acc, blog) => {
        const date = new Date(blog.published_at || blog.created_at);
        const key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        if (!acc[key]) acc[key] = [];
        acc[key].push(blog);
        return acc;
    }, {} as Record<string, typeof blogs>);

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-[var(--pb-border)]" />
            <div className={`flex flex-col ${gapClass}`}>
                {Object.entries(grouped).map(([period, periodBlogs]) => (
                    <div key={period} className="relative">
                        {/* Period marker */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-6 rounded-full bg-[var(--pb-foreground)] border-2 border-[var(--pb-background)] flex items-center justify-center z-10">
                                <div className="w-2 h-2 rounded-full bg-[var(--pb-background)]" />
                            </div>
                            <span className="text-xs font-semibold text-[var(--pb-text-muted)] uppercase tracking-wide">{period}</span>
                        </div>
                        <div className={`flex flex-col ${gapClass} pl-9`}>
                            {periodBlogs.map((blog, index) => (
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
                                        fullWidth={true}
                                    />
                                </MotionItem>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
