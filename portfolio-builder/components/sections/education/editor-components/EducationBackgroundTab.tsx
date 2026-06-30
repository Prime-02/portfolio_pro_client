// portfolio-builder/components/sections/education/editor-components/EducationBackgroundTab.tsx

import { EducationData } from "@/portfolio-builder/types/education";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";

interface EducationBackgroundTabProps {
  data: EducationData;
  onUpdate: (value: Partial<EducationData["background"]>) => void;
}

export default function EducationBackgroundTab({ data, onUpdate }: EducationBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
    />
  );
}
