// portfolio-builder/types/certification.ts

import type { BioAnimations } from "./bio";
import type { BioCTA } from "./bio";

// ---------------------------------------------------------------------------
// Certification card display options
// ---------------------------------------------------------------------------

export type CertificationCardStyle =
  | "badge"
  | "credential"
  | "compact"
  | "detailed"
  | "verification"
  | "minimal";

export type CertificationLayout =
  | "badge-grid"
  | "credential-wall"
  | "certificate-carousel"
  | "verification-list"
  | "cert-timeline"
  | "cert-masonry";

export type CertificationSortBy =
  | "default"
  | "date-desc"
  | "date-asc"
  | "issuer-asc"
  | "issuer-desc"
  | "name-asc"
  | "name-desc";

export type DateDisplayFormat =
  | "relative"
  | "month-year"
  | "year-only"
  | "full-date";

// ---------------------------------------------------------------------------
// Public-facing certification filters
// ---------------------------------------------------------------------------

export interface PublicCertificationFilters {
  issuing_organization?: string;
  ids?: string[];
  merge_filters?: boolean;
}

// ---------------------------------------------------------------------------
// Certification card override — style specific entries differently
// ---------------------------------------------------------------------------

export interface CertificationCardOverride {
  /** Which certifications this override applies to */
  target: {
    ids?: string[];
    issuing_organizations?: string[];
    certification_names?: string[];
    has_expiration?: boolean;
    is_expired?: boolean;
  };
  /** Style to apply */
  style: CertificationCardStyle;
  /** Custom accent color */
  accentColor?: string;
  /** Whether to show certification name */
  showCertificationName?: boolean;
  /** Whether to show issuing organization */
  showIssuingOrganization?: boolean;
  /** Whether to show issue date */
  showIssueDate?: boolean;
  /** Whether to show expiration date */
  showExpirationDate?: boolean;
  /** Whether to show certificate link */
  showCertificateLink?: boolean;
  /** Whether to show verification badge */
  showVerificationBadge?: boolean;
  /** Whether to show validity indicator */
  showValidityIndicator?: boolean;
  /** Whether to show description */
  showDescription?: boolean;
}

// ---------------------------------------------------------------------------
// Certification filter configuration (editor-facing)
// ---------------------------------------------------------------------------

export interface CertificationFilterConfig {
  /** Hand-picked certification IDs */
  ids?: string[];
  /** Filter by issuing organization */
  issuing_organization?: string;
  /** Filter by certification name */
  certification_name?: string;
  /** Show only expired certifications */
  is_expired?: boolean;
  /** Show only non-expired certifications */
  is_valid?: boolean;
  /** Merge multiple filters (AND vs OR logic) */
  merge_filters?: boolean;
  /** Optional sort override for renderer */
  _sortBy?: CertificationSortBy;
}

// ---------------------------------------------------------------------------
// Certification data — saved in portfolio layout
// ---------------------------------------------------------------------------

export interface CertificationData {
  // ── Filters ──
  filters: CertificationFilterConfig;

  // ── Layout ──
  layout: CertificationLayout;
  alignment: "left" | "center" | "right";
  columns: number; // 1-4 (grid only)
  gap: "small" | "medium" | "large";
  maxWidth: number;
  padding?: { top?: number; bottom?: number };

  // ── Card styling ──
  cardStyle: CertificationCardStyle;
  cardSize: "small" | "medium" | "large";
  showCertificationName: boolean;
  showIssuingOrganization: boolean;
  showIssueDate: boolean;
  showExpirationDate: boolean;
  showCertificateLink: boolean;
  showVerificationBadge: boolean;
  showValidityIndicator: boolean;
  showDescription: boolean;
  dateDisplayFormat: DateDisplayFormat;
  cardOverrides: CertificationCardOverride[];

  // ── Section content ──
  headline?: string;
  subheadline?: string;

  // ── Background ──
  background: {
    type:
      | "none"
      | "solid"
      | "gradient"
      | "image"
      | "video"
      | "mesh"
      | "particles";
    color?: string;
    gradientType?: "linear" | "radial";
    gradientFrom?: string;
    gradientTo?: string;
    gradientAngle?: number | string;
    radialPosition?: string;
    imageUrl?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: boolean;
    videoUrl?: string;
    meshColor1?: string;
    meshColor2?: string;
    meshColor3?: string;
    meshColor4?: string;
    meshSpeed?: number;
    meshBlur?: number;
    meshSize?: number;
    meshBase?: string;
    meshOpacity?: number;
    particleColor?: string;
    particleCount?: number;
    particleSize?: number;
    particleSpeed?: number;
    particleOpacity?: number;
    particleLines?: boolean;
    particleLineDist?: number;
    particleBg?: string;
    overlayColor?: string;
    overlayOpacity?: number;
  };

  // ── Animations ──
  animations: BioAnimations;

  // ── CTA ──
  ctaButtons?: BioCTA[];
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export function getEmptyCertificationData(): CertificationData {
  return {
    filters: {},
    layout: "badge-grid",
    alignment: "left",
    columns: 3,
    gap: "medium",
    maxWidth: 1200,
    padding: { top: 80, bottom: 80 },
    cardStyle: "badge",
    cardSize: "medium",
    showCertificationName: true,
    showIssuingOrganization: true,
    showIssueDate: true,
    showExpirationDate: true,
    showCertificateLink: true,
    showVerificationBadge: true,
    showValidityIndicator: true,
    showDescription: true,
    dateDisplayFormat: "month-year",
    cardOverrides: [],
    headline: "Certifications",
    subheadline: undefined,
    background: { type: "none" },
    animations: {
      preset: "fadeIn",
      duration: 0.5,
      delay: 0.1,
      easing: "easeOut",
      staggerChildren: true,
      staggerDelay: 0.12,
      scrollTrigger: true,
      scrollOnce: true,
      parallax: false,
      parallaxIntensity: 15,
      hoverEffect: "scale",
      hoverScale: 1.03,
      textReveal: false,
      textRevealDelay: 0.2,
    },
    ctaButtons: undefined,
  };
}
