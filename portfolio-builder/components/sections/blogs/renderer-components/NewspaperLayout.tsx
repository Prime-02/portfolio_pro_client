// portfolio-builder/components/sections/blogs/renderer-components/NewspaperLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import BlogCard from "./BlogCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function NewspaperLayout({ blogs, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
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

    const headline = blogs[0];
    const columns = blogs.slice(1);
    const midPoint = Math.ceil(columns.length / 2);
    const leftColumn = columns.slice(0, midPoint);
    const rightColumn = columns.slice(midPoint);

    return (
        <div className={`flex flex-col ${gapClass}`}>
            {/* Headline / Lead story */}
            {headline && (
                <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                    <BlogCard
                        blog={headline}
                        config={resolveCardOverride(headline, data.cardOverrides, { ...defaults, style: "featured" })}
                        cardSize="large"
                        fullWidth={true}
                    />
                </MotionItem>
            )}

            {/* Two-column grid below */}
            {columns.length > 0 && (
                <div className={`grid grid-cols-1 lg:grid-cols-2 ${gapClass}`}>
                    <div className={`flex flex-col ${gapClass}`}>
                        {leftColumn.map((blog, index) => (
                            <MotionItem key={blog.id || index} isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                                <BlogCard blog={blog} config={resolveCardOverride(blog, data.cardOverrides, defaults)} cardSize={data.cardSize} fullWidth={true} />
                            </MotionItem>
                        ))}
                    </div>
                    <div className={`flex flex-col ${gapClass}`}>
                        {rightColumn.map((blog, index) => (
                            <MotionItem key={blog.id || index} isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                                <BlogCard blog={blog} config={resolveCardOverride(blog, data.cardOverrides, defaults)} cardSize={data.cardSize} fullWidth={true} />
                            </MotionItem>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
