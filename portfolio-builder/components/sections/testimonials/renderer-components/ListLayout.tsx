// portfolio-builder/components/sections/testimonials/renderer-components/ListLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import TestimonialCard from "./TestimonialCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-2", medium: "gap-3", large: "gap-4" } as const;

export default function ListLayout({ testimonials, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
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
    <div className={`flex flex-col ${gapClass} w-full`}>
      {testimonials.map((testimonial, index) => (
        <MotionItem
          key={testimonial.id || index}
          isAnimated={isAnimated}
          shouldAnimate={shouldAnimate}
          anim={anim}
        >
          <div className="w-full">
            <TestimonialCard
              testimonial={testimonial}
              config={resolveCardOverride(testimonial, data.cardOverrides, defaults)}
              cardSize={data.cardSize}
              fullWidth={true}
            />
          </div>
        </MotionItem>
      ))}
    </div>
  );
}
