// portfolio-builder/components/sections/experience/renderer-components/ListLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import ExperienceCard from "./ExperienceCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-2", medium: "gap-3", large: "gap-4" } as const;

export default function ListLayout({ experiences, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
  const gapClass = GAP_CLASS[data.gap];

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
    <div className={`flex flex-col ${gapClass} w-full`}>
      {experiences.map((exp, index) => (
        <MotionItem
          key={exp.id || index}
          isAnimated={isAnimated}
          shouldAnimate={shouldAnimate}
          anim={anim}
        >
          <div className="w-full">
            <ExperienceCard
              experience={exp}
              config={resolveCardOverride(exp, data.cardOverrides, defaults)}
              cardSize={data.cardSize}
              fullWidth={true}
            />
          </div>
        </MotionItem>
      ))}
    </div>
  );
}
