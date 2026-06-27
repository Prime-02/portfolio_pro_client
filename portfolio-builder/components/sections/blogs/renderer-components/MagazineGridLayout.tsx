// portfolio-builder/components/sections/blogs/renderer-components/MagazineGridLayout.tsx

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

export default function MagazineGridLayout({ blogs, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
    const colClass = COL_CLASS[data.columns] ?? "grid-cols-2";
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

    // First item is featured (spans full width), rest in grid
    const featured = blogs[0];
    const rest = blogs.slice(1);

    return (
        <div className={`grid ${colClass} ${gapClass}`}>
            {featured && (
                <MotionItem
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                    className="col-span-full"
                >
                    <BlogCard
                        blog={featured}
                        config={resolveCardOverride(featured, data.cardOverrides, { ...defaults, style: "featured" })}
                        cardSize={data.cardSize}
                        fullWidth={true}
                    />
                </MotionItem>
            )}
            {rest.map((blog, index) => (
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
    );
}
