// portfolio-builder/components/sections/testimonials/editor-components/TestimonialsBackgroundTab.tsx

import { TestimonialsData } from "@/portfolio-builder/types/testimonials";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";
import { SectionBackgroundType } from "@/portfolio-builder/components/shared/background/types/sectionBackground";

interface TestimonialsBackgroundTabProps {
  data: TestimonialsData;
  onUpdate: (value: Partial<TestimonialsData["background"]>) => void;
  allowedTypes?: SectionBackgroundType[];
}

export default function TestimonialsBackgroundTab({ data, onUpdate, allowedTypes }: TestimonialsBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
      allowedTypes={allowedTypes}
    />
  );
}
