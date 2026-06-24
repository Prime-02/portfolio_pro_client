// portfolio-builder/components/sections/education/renderer-components/layoutProps.ts

import type { EducationData } from "@/portfolio-builder/types/education";
import type { BioAnimations } from "@/portfolio-builder/types/bio";

// Education item shape expected by the renderer
// (mirrors what the store returns, but kept renderer-agnostic)
export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  institution_logo_url?: string | null;
  field_of_study?: string | null;
  start_year?: string | null;
  end_year?: string | null;
  is_current?: boolean;
  description?: string | null;
  [key: string]: unknown;
}

export interface LayoutProps {
  educations: EducationItem[];
  data: EducationData;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
}
