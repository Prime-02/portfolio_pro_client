// portfolio-builder/components/sections/experience/renderer-components/TimelineLayout.tsx

import { useMemo } from "react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import ExperienceCard from "./ExperienceCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-6", medium: "gap-8", large: "gap-10" } as const;

function parseDate(dateStr: string | null | undefined): number {
  if (!dateStr) return Date.now();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

export default function TimelineLayout({
  experiences,
  data,
  isAnimated,
  shouldAnimate,
  anim,
}: LayoutProps) {
  const gapClass = GAP_CLASS[data.gap];

  const sorted = useMemo(() => {
    return [...experiences].sort(
      (a, b) =>
        parseDate(b.end_date || b.start_date) -
        parseDate(a.end_date || a.start_date),
    );
  }, [experiences]);

  const defaults = {
    style: data.cardStyle === "timeline" ? "timeline" : data.cardStyle,
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
    <div className={`relative flex flex-col ${gapClass}`}>
      {/* Central timeline line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[var(--pb-border)] md:-translate-x-px" />

      {sorted.map((exp, index) => {
        const isLeft = index % 2 === 0;
        const config = resolveCardOverride(exp, data.cardOverrides, defaults);

        const card = (
          <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
            <ExperienceCard
              experience={exp}
              config={config}
              cardSize={data.cardSize}
              fullWidth={true}
            />
          </MotionItem>
        );

        return (
          <div key={exp.id || index} className="relative flex items-center">
            {/* Timeline node — pinned to spine */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
              <div
                className={`w-3 h-3 rounded-full border-2 border-[var(--pb-background)] ${exp.is_current ? "bg-[var(--pb-success)]" : "bg-[var(--pb-foreground)]"
                  }`}
              />
            </div>

            {/* Left column: pr-8 keeps card edge away from spine */}
            <div className="hidden md:flex md:w-1/2 md:pr-8 md:justify-end">
              {isLeft && card}
            </div>

            {/* Right column: pl-8 keeps card edge away from spine */}
            {/* On mobile this is the only column, offset by pl-10 to clear the mobile spine */}
            <div className="pl-10 w-full md:pl-8 md:w-1/2">
              {!isLeft && card}
              {/* Mobile fallback for left cards */}
              {isLeft && <div className="md:hidden">{card}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}