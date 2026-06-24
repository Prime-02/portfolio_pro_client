// portfolio-builder/components/sections/education/renderer-components/HonorsWallLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import EducationCard from "./EducationCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function HonorsWallLayout({ educations, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
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
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gapClass}`}>
      {educations.map((edu, index) => (
        <MotionItem
          key={edu.id || index}
          isAnimated={isAnimated}
          shouldAnimate={shouldAnimate}
          anim={anim}
        >
          <div className="h-full">
            <EducationCard
              education={edu}
              config={resolveCardOverride(edu, data.cardOverrides, defaults)}
              cardSize={data.cardSize}
            />
          </div>
        </MotionItem>
      ))}
    </div>
  );
}
