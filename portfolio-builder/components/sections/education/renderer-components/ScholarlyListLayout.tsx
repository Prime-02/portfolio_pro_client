// portfolio-builder/components/sections/education/renderer-components/ScholarlyListLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import EducationCard from "./EducationCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-2", medium: "gap-3", large: "gap-4" } as const;

export default function ScholarlyListLayout({ educations, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
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
    <div className={`flex flex-col ${gapClass} w-full`}>
      {educations.map((edu, index) => (
        <MotionItem
          key={edu.id || index}
          isAnimated={isAnimated}
          shouldAnimate={shouldAnimate}
          anim={anim}
        >
          <div className="w-full">
            <EducationCard
              education={edu}
              config={resolveCardOverride(edu, data.cardOverrides, defaults)}
              cardSize={data.cardSize}
              fullWidth={true}
            />
          </div>
        </MotionItem>
      ))}
    </div>
  );
}
