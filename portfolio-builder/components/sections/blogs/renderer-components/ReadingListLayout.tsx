// portfolio-builder/components/sections/blogs/renderer-components/ReadingListLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import BlogCard from "./BlogCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-2", medium: "gap-3", large: "gap-4" } as const;

export default function ReadingListLayout({ blogs, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
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

    return (
        <div className={`flex flex-col ${gapClass} w-full`}>
            {blogs.map((blog, index) => (
                <MotionItem
                    key={blog.id || index}
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                >
                    <div className="flex items-start gap-4 w-full">
                        {/* Numbered index */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] flex items-center justify-center">
                            <span className="text-xs font-bold text-[var(--pb-text-muted)]">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <BlogCard
                                blog={blog}
                                config={resolveCardOverride(blog, data.cardOverrides, defaults)}
                                cardSize={data.cardSize}
                                fullWidth={true}
                                index={index}
                            />
                        </div>
                    </div>
                </MotionItem>
            ))}
        </div>
    );
}
