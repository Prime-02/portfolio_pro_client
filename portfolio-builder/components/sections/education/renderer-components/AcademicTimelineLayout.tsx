// portfolio-builder/components/sections/education/renderer-components/AcademicTimelineLayout.tsx

import { useMemo } from "react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import EducationCard from "./EducationCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-6", medium: "gap-8", large: "gap-10" } as const;

function parseDate(dateStr: string | null | undefined): number {
  if (!dateStr) return Date.now();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

export default function AcademicTimelineLayout({
  educations,
  data,
  isAnimated,
  shouldAnimate,
  anim,
}: LayoutProps) {
  const gapClass = GAP_CLASS[data.gap];

  const sorted = useMemo(() => {
    return [...educations].sort(
      (a, b) =>
        parseDate(b.end_year || b.start_year) -
        parseDate(a.end_year || a.start_year),
    );
  }, [educations]);

  const defaults = {
    style: data.cardStyle === "transcript" ? "transcript" : data.cardStyle,
    showInstitutionLogo: data.showInstitutionLogo,
    showInstitution: data.showInstitution,
    showDegree: data.showDegree,
    showFieldOfStudy: data.showFieldOfStudy,
    showDates: data.showDates,
    showDuration: data.showDuration,
    showDescription: data.showDescription,
    showCurrentIndicator: data.showCurrentIndicator,
    dateDisplayFormat: data.dateDisplayFormat,
  } as const;

  return (
    <div className={`relative flex flex-col ${gapClass}`}>
      {/* Central timeline line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[var(--pb-border)] md:-translate-x-px" />

      {sorted.map((edu, index) => {
        const isLeft = index % 2 === 0;
        const config = resolveCardOverride(edu, data.cardOverrides, defaults);

        const card = (
          <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
            <EducationCard
              education={edu}
              config={config}
              cardSize={data.cardSize}
              fullWidth={true}
            />
          </MotionItem>
        );

        return (
          <div key={edu.id || index} className="relative flex items-center">
            {/* Timeline node — pinned to spine */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
              <div
                className={`w-3 h-3 rounded-full border-2 border-[var(--pb-background)] ${edu.is_current ? "bg-[var(--pb-success)]" : "bg-[var(--pb-foreground)]"
                  }`}
              />
            </div>

            {/* Left column */}
            <div className="hidden md:flex md:w-1/2 md:pr-8 md:justify-end">
              {isLeft && card}
            </div>

            {/* Right column */}
            <div className="pl-10 w-full md:pl-8 md:w-1/2">
              {!isLeft && card}
              {isLeft && <div className="md:hidden">{card}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
