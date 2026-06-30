"use client";

import { CertificationData } from "@/portfolio-builder/types/certification";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";
import { SectionBackgroundType } from "@/portfolio-builder/components/shared/background/types/sectionBackground";

interface CertificationBackgroundTabProps {
  data: CertificationData;
  onUpdate: (value: Partial<CertificationData["background"]>) => void;
}

export default function CertificationBackgroundTab({ data, onUpdate }: CertificationBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
    />
  );
}
