// portfolio-builder/components/sections/skills/editor-components/SkillsBackgroundTab.tsx

import { SkillsData } from "@/portfolio-builder/types/skills";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";

interface SkillsBackgroundTabProps {
  data: SkillsData;
  onUpdate: (value: Partial<SkillsData["background"]>) => void;
}

export default function SkillsBackgroundTab({ data, onUpdate }: SkillsBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
    />
  );
}
