// portfolio-builder/components/sections/skills/editor-components/SkillsBackgroundTab.tsx

import { SkillsData } from "@/portfolio-builder/types/skills";
import BackgroundTab from "@/portfolio-builder/components/shared/editor/BackgroundTab";

interface SkillsBackgroundTabProps {
  data: SkillsData;
  onUpdate: (value: Partial<SkillsData["background"]>) => void;
  allowedTypes?: ("none" | "solid" | "gradient" | "image" | "pattern")[];
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
