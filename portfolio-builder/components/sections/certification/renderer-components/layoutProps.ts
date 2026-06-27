// portfolio-builder/components/sections/certification/renderer-components/layoutProps.ts

import type { CertificationData } from "@/portfolio-builder/types/certification";
import type { BioAnimations } from "@/portfolio-builder/types/bio";

// Certification item shape expected by the renderer
// (mirrors what the store returns, but kept renderer-agnostic)
export interface CertificationItem {
  id: string;
  certification_name: string;
  issuing_organization: string;
  issue_date?: string | null;
  expiration_date?: string | null;
  certificate_external_url?: string | null;
  certificate_internal_url?: string | null;
  certificate_internal_url_id?: string | null;
  is_public?: boolean | null;
  [key: string]: unknown;
}

export interface LayoutProps {
  certifications: CertificationItem[];
  data: CertificationData;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
}
