// portfolio-builder/components/sections/testimonials/editor-components/TestimonialsBackgroundTab.tsx

import { TestimonialsData } from "@/portfolio-builder/types/testimonials";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";

interface TestimonialsBackgroundTabProps {
  data: TestimonialsData;
  onUpdate: (value: Partial<TestimonialsData["background"]>) => void;
}

export default function TestimonialsBackgroundTab({ data, onUpdate }: TestimonialsBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
    />
  );
}
