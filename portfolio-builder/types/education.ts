// portfolio-builder/types/education.ts

import type { BioAnimations } from "./bio";
import type { BioCTA } from "./bio";

// ---------------------------------------------------------------------------
// Education card display options
// ---------------------------------------------------------------------------

export type EducationCardStyle =
  | "academic"
  | "diploma"
  | "minimal"
  | "compact"
  | "detailed"
  | "transcript";

export type EducationLayout =
  | "academic-timeline"
  | "diploma-grid"
  | "scholarly-list"
  | "credentials-carousel"
  | "transcript-accordion"
  | "honors-wall";

export type EducationSortBy =
  | "default"
  | "date-desc"
  | "date-asc"
  | "institution-asc"
  | "institution-desc"
  | "degree-asc"
  | "degree-desc";

export type DateDisplayFormat =
  | "relative"
  | "month-year"
  | "year-only"
  | "full-date";

// ---------------------------------------------------------------------------
// Education card override — style specific entries differently
// ---------------------------------------------------------------------------

export interface EducationCardOverride {
  /** Which educations this override applies to */
  target: {
    ids?: string[];
    institutions?: string[];
    degrees?: string[];
    fields_of_study?: string[];
    is_current?: boolean;
  };
  /** Style to apply */
  style: EducationCardStyle;
  /** Custom accent color */
  accentColor?: string;
  /** Whether to show institution logo */
  showInstitutionLogo?: boolean;
  /** Whether to show institution name */
  showInstitution?: boolean;
  /** Whether to show degree */
  showDegree?: boolean;
  /** Whether to show field of study */
  showFieldOfStudy?: boolean;
  /** Whether to show dates */
  showDates?: boolean;
  /** Whether to show duration */
  showDuration?: boolean;
  /** Whether to show description */
  showDescription?: boolean;
  /** Whether to show current indicator */
  showCurrentIndicator?: boolean;
}

// ---------------------------------------------------------------------------
// Education filter configuration (public-facing)
// ---------------------------------------------------------------------------

export interface EducationFilterConfig {
  /** Hand-picked education IDs */
  ids?: string[];
  /** Filter by current status */
  is_current?: boolean;
  /** Filter by institution name */
  institution?: string;
  /** Filter by degree */
  degree?: string;
  /** Filter by field of study */
  field_of_study?: string;
  /** Merge multiple filters (AND vs OR logic) */
  merge_filters?: boolean;
  /** Optional sort override for renderer */
  _sortBy?: EducationSortBy;
}

// ---------------------------------------------------------------------------
// Education data — saved in portfolio layout
// ---------------------------------------------------------------------------

export interface EducationData {
  // ── Filters ──
  filters: EducationFilterConfig;

  // ── Layout ──
  layout: EducationLayout;
  alignment: "left" | "center" | "right";
  columns: number; // 1-4 (grid only)
  gap: "small" | "medium" | "large";
  maxWidth: number;
  padding?: { top?: number; bottom?: number };

  // ── Card styling ──
  cardStyle: EducationCardStyle;
  cardSize: "small" | "medium" | "large";
  showInstitutionLogo: boolean;
  showInstitution: boolean;
  showDegree: boolean;
  showFieldOfStudy: boolean;
  showDates: boolean;
  showDuration: boolean;
  showDescription: boolean;
  showCurrentIndicator: boolean;
  dateDisplayFormat: DateDisplayFormat;
  cardOverrides: EducationCardOverride[];

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

export function getEmptyEducationData(): EducationData {
  return {
    filters: {},
    layout: "academic-timeline",
    alignment: "left",
    columns: 2,
    gap: "medium",
    maxWidth: 1200,
    padding: { top: 80, bottom: 80 },
    cardStyle: "academic",
    cardSize: "medium",
    showInstitutionLogo: true,
    showInstitution: true,
    showDegree: true,
    showFieldOfStudy: true,
    showDates: true,
    showDuration: true,
    showDescription: true,
    showCurrentIndicator: true,
    dateDisplayFormat: "month-year",
    cardOverrides: [],
    headline: "Education",
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
