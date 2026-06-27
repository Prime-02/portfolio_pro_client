// portfolio-builder/components/sections/testimonials/renderer-components/MasonryLayout.tsx

import { useMemo } from "react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import TestimonialCard from "./TestimonialCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_PX = { small: 12, medium: 16, large: 24 } as const;

function splitIntoColumns<T>(items: T[], numCols: number): T[][] {
  if (numCols <= 1) return [items];
  const cols: T[][] = Array.from({ length: numCols }, () => []);
  items.forEach((item, i) => cols[i % numCols].push(item));
  return cols;
}

export default function MasonryLayout({
  testimonials,
  data,
  isAnimated,
  shouldAnimate,
  anim,
}: LayoutProps) {
  const gapPx = GAP_PX[data.gap];

  const numCols = Math.min(Math.max(data.columns, 1), 6);
  const columns = useMemo(() => splitIntoColumns(testimonials, numCols), [testimonials, numCols]);

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
    <div
      className="flex items-start w-full overflow-hidden"
      style={{ gap: `${gapPx}px` }}
    >
      {columns.map((col, colIndex) => (
        <div
          key={colIndex}
          className="flex-1 min-w-0 flex flex-col"
          style={{ gap: `${gapPx}px` }}
        >
          {col.map((testimonial, index) => (
            <MotionItem
              key={testimonial.id || `${colIndex}-${index}`}
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
      ))}
    </div>
  );
}
