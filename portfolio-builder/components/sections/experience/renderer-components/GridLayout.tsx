// portfolio-builder/components/sections/experience/renderer-components/GridLayout.tsx

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

export default function GridLayout({ experiences, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
  const colClass = COL_CLASS[data.columns] ?? "grid-cols-2";
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
    <div className={`grid ${colClass} ${gapClass}`}>
      {experiences.map((exp, index) => (
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
  );
}
