// portfolio-builder/components/sections/skills/editor-components/SkillsBackgroundTab.tsx

import { SkillsData } from "@/portfolio-builder/types/skills";
import BackgroundTab from "@/portfolio-builder/components/shared/editor/BackgroundTab";
import { SectionBackgroundType } from "@/portfolio-builder/types/sectionBackground";

interface SkillsBackgroundTabProps {
  data: SkillsData;
  onUpdate: (value: Partial<SkillsData["background"]>) => void;
  allowedTypes?: SectionBackgroundType[]
}

export default function SkillsBackgroundTab({ data, onUpdate, allowedTypes }: SkillsBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
      allowedTypes={allowedTypes}
    />
  );
}
