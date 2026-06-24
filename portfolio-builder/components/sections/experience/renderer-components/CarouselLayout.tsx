// portfolio-builder/components/sections/experience/renderer-components/CarouselLayout.tsx

import { useState } from "react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import ExperienceCard from "./ExperienceCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const COL_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function CarouselLayout({
  experiences,
  data,
  isAnimated,
  shouldAnimate,
  anim,
}: LayoutProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = Math.min(Math.max(data.columns, 1), 4);
  const totalPages = Math.ceil(experiences.length / itemsPerPage);
  const colClass = COL_CLASS[itemsPerPage] ?? "grid-cols-2";
  const gapClass = GAP_CLASS[data.gap];

  const next = () => setCurrentPage((p) => (p + 1) % totalPages);
  const prev = () => setCurrentPage((p) => (p - 1 + totalPages) % totalPages);
  const goTo = (i: number) => setCurrentPage(i);

  const pageExps = experiences.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const defaults = {
    style: data.cardStyle,
    showCompanyLogo: data.showCompanyLogo,
    showDescription: data.showDescription,
    showEmploymentType: data.showEmploymentType,
    showLocationType: data.showLocationType,
    showDuration: data.showDuration,
    showSkills: data.showSkills,
    showCompanyName: data.showCompanyName,
    showJobTitle: data.showJobTitle,
    dateDisplayFormat: data.dateDisplayFormat,
  } as const;

  return (
    <div className="space-y-5">
      <div className={`grid ${colClass} ${gapClass}`}>
        {pageExps.map((exp, index) => (
          <MotionItem
            key={exp.id || index}
            isAnimated={isAnimated}
            shouldAnimate={shouldAnimate}
            anim={anim}
          >
            <ExperienceCard
              experience={exp}
              config={resolveCardOverride(exp, data.cardOverrides, defaults)}
              cardSize={data.cardSize}
            />
          </MotionItem>
        ))}
      </div>

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
                className={`rounded-full transition-all duration-200 ${
                  i === currentPage
                    ? "w-5 h-2 bg-[var(--pb-foreground)]"
                    : "w-2 h-2 bg-[var(--pb-border)] hover:bg-[var(--pb-foreground-20)]"
                }`}
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
