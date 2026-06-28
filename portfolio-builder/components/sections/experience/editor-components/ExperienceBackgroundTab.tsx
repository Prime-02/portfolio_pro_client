// portfolio-builder/components/sections/experience/editor-components/ExperienceBackgroundTab.tsx

import { ExperienceData } from "@/portfolio-builder/types/experience";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";
import { SectionBackgroundType } from "@/portfolio-builder/types/sectionBackground";

interface ExperienceBackgroundTabProps {
  data: ExperienceData;
  onUpdate: (value: Partial<ExperienceData["background"]>) => void;
  allowedTypes?: SectionBackgroundType[];
}

export default function ExperienceBackgroundTab({ data, onUpdate, allowedTypes }: ExperienceBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
      allowedTypes={allowedTypes}
    />
  );
}
