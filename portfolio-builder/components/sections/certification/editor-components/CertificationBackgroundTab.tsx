"use client";

import { CertificationData } from "@/portfolio-builder/types/certification";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";
import { SectionBackgroundType } from "@/portfolio-builder/types/sectionBackground";

interface CertificationBackgroundTabProps {
  data: CertificationData;
  onUpdate: (value: Partial<CertificationData["background"]>) => void;
  allowedTypes?: SectionBackgroundType[];
}

export default function CertificationBackgroundTab({ data, onUpdate, allowedTypes }: CertificationBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
      allowedTypes={allowedTypes}
    />
  );
}
