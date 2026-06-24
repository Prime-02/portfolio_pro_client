// portfolio-builder/components/sections/experience/renderer-components/layoutProps.ts

import type { ExperienceData } from "@/portfolio-builder/types/experience";
import type { BioAnimations } from "@/portfolio-builder/types/bio";

// Experience item shape expected by the renderer
// (mirrors what the store returns, but kept renderer-agnostic)
export interface ExperienceItem {
  id: string;
  job_title: string;
  company_name: string;
  company_logo_url?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  is_featured?: boolean;
  employment_type?: string | null;
  location_type?: string | null;
  industry?: string | null;
  location?: string | null;
  skills?: string[];
  [key: string]: unknown;
}

export interface LayoutProps {
  experiences: ExperienceItem[];
  data: ExperienceData;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
}
