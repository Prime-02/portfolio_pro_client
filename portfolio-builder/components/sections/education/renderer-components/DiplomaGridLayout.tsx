// portfolio-builder/components/sections/education/renderer-components/DiplomaGridLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import EducationCard from "./EducationCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const COL_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function DiplomaGridLayout({ educations, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
  const colClass = COL_CLASS[data.columns] ?? "grid-cols-2";
  const gapClass = GAP_CLASS[data.gap];

  const defaults = {
    style: data.cardStyle,
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
    <div className={`grid ${colClass} ${gapClass}`}>
      {educations.map((edu, index) => (
        <MotionItem
          key={edu.id || index}
          isAnimated={isAnimated}
          shouldAnimate={shouldAnimate}
          anim={anim}
        >
          <EducationCard
            education={edu}
            config={resolveCardOverride(edu, data.cardOverrides, defaults)}
            cardSize={data.cardSize}
          />
        </MotionItem>
      ))}
    </div>
  );
}
