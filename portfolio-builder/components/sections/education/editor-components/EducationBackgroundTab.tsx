// portfolio-builder/components/sections/education/editor-components/EducationBackgroundTab.tsx

import { EducationData } from "@/portfolio-builder/types/education";
import BackgroundTab from "@/portfolio-builder/components/shared/editor/BackgroundTab";
import { SectionBackgroundType } from "@/portfolio-builder/types/sectionBackground";

interface EducationBackgroundTabProps {
  data: EducationData;
  onUpdate: (value: Partial<EducationData["background"]>) => void;
  allowedTypes?: SectionBackgroundType[];
}

export default function EducationBackgroundTab({ data, onUpdate, allowedTypes }: EducationBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
      allowedTypes={allowedTypes}
    />
  );
}
