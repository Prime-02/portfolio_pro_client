// portfolio-builder/components/sections/testimonials/renderer-components/GridLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import TestimonialCard from "./TestimonialCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const COL_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function GridLayout({ testimonials, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
  const colClass = COL_CLASS[data.columns] ?? "grid-cols-3";
  const gapClass = GAP_CLASS[data.gap];

  const defaults = {
    style: data.cardStyle,
    showAvatar: data.showAvatar,
    avatarDisplay: data.avatarDisplay,
    showAuthorName: data.showAuthorName,
    showAuthorTitle: data.showAuthorTitle,
    showAuthorCompany: data.showAuthorCompany,
    showAuthorRelationship: data.showAuthorRelationship,
    showContent: data.showContent,
    showRating: data.showRating,
    ratingDisplay: data.ratingDisplay,
    showDate: data.showDate,
    dateDisplay: data.dateDisplay,
    showFeaturedBadge: data.showFeaturedBadge,
  } as const;

  return (
    <div className={`grid ${colClass} ${gapClass}`}>
      {testimonials.map((testimonial, index) => (
        <MotionItem
          key={testimonial.id || index}
          isAnimated={isAnimated}
          shouldAnimate={shouldAnimate}
          anim={anim}
        >
          <TestimonialCard
            testimonial={testimonial}
            config={resolveCardOverride(testimonial, data.cardOverrides, defaults)}
            cardSize={data.cardSize}
          />
        </MotionItem>
      ))}
    </div>
  );
}
