// portfolio-builder/types/experience.ts

import {
  EmploymentType as StoreEmploymentType,
  LocationType as StoreLocationType,
} from "@/lib/stores/experiences/useExperience";
import type { BioAnimations } from "./bio";
import type { BioCTA } from "./bio";
import { SectionBackgroundType } from "../components/shared/background";

// ---------------------------------------------------------------------------
// Employment & Location types
// ---------------------------------------------------------------------------

export type EmploymentType = StoreEmploymentType;

export type LocationType = StoreLocationType;
// ---------------------------------------------------------------------------
// Experience card display options
// ---------------------------------------------------------------------------

export type ExperienceCardStyle =
  | "timeline"
  | "standard"
  | "detailed"
  | "compact"
  | "minimal";

export type ExperienceLayout =
  | "timeline"
  | "timeline-horizontal"
  | "grid"
  | "list"
  | "carousel"
  | "accordion";

export type ExperienceSortBy =
  | "default"
  | "date-desc"
  | "date-asc"
  | "company-asc"
  | "company-desc"
  | "title-asc"
  | "title-desc";

export type DateDisplayFormat =
  | "relative"
  | "month-year"
  | "year-only"
  | "full-date";

// ---------------------------------------------------------------------------
// Experience card override — style specific experiences differently
// ---------------------------------------------------------------------------

export interface ExperienceCardOverride {
  /** Which experiences this override applies to */
  target: {
    ids?: string[];
    industries?: string[];
    employment_types?: EmploymentType[];
    location_types?: LocationType[];
    is_featured?: boolean;
    is_current?: boolean;
  };
  /** Style to apply */
  style: ExperienceCardStyle;
  /** Custom accent color */
  accentColor?: string;
  /** Whether to show company logo */
  showCompanyLogo?: boolean;
  /** Whether to show description */
  showDescription?: boolean;
  /** Whether to show employment type */
  showEmploymentType?: boolean;
  /** Whether to show location type */
  showLocationType?: boolean;
  /** Whether to show duration */
  showDuration?: boolean;
  /** Whether to show skills/tags */
  showSkills?: boolean;
  /** Whether to show company name */
  showCompanyName?: boolean;
  /** Whether to show job title */
  showJobTitle?: boolean;
}

// ---------------------------------------------------------------------------
// Experience filter configuration (public-facing)
// ---------------------------------------------------------------------------

export interface ExperienceFilterConfig {
  /** Hand-picked experience IDs */
  ids?: string[];
  /** Filter by featured status */
  is_featured?: boolean;
  /** Filter by current status */
  is_current?: boolean;
  /** Filter by employment type */
  employment_type?: EmploymentType;
  /** Filter by location type */
  location_type?: LocationType;
  /** Filter by industry */
  industry?: string;
  /** Merge multiple filters (AND vs OR logic) */
  merge_filters?: boolean;
  /** Optional sort override for renderer */
  _sortBy?: ExperienceSortBy;
}

// ---------------------------------------------------------------------------
// Experience data — saved in portfolio layout
// ---------------------------------------------------------------------------

export interface ExperienceData {
  // ── Filters ──
  filters: ExperienceFilterConfig;

  // ── Layout ──
  layout: ExperienceLayout;
  alignment: "left" | "center" | "right";
  columns: number; // 1-4 (grid only)
  gap: "small" | "medium" | "large";
  maxWidth: number;
  padding?: { top?: number; bottom?: number };

  // ── Card styling ──
  cardStyle: ExperienceCardStyle;
  cardSize: "small" | "medium" | "large";
  showCompanyLogo: boolean;
  showDescription: boolean;
  showEmploymentType: boolean;
  showLocationType: boolean;
  showDuration: boolean;
  showSkills: boolean;
  showCompanyName: boolean;
  showJobTitle: boolean;
  dateDisplayFormat: DateDisplayFormat;
  cardOverrides: ExperienceCardOverride[];

  // ── Section content ──
  headline?: string;
  subheadline?: string;

  // ── Background ──
  background: {
    type: SectionBackgroundType;
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

export function getEmptyExperienceData(): ExperienceData {
  return {
    filters: {},
    layout: "timeline",
    alignment: "left",
    columns: 2,
    gap: "medium",
    maxWidth: 1200,
    padding: { top: 80, bottom: 80 },
    cardStyle: "standard",
    cardSize: "medium",
    showCompanyLogo: true,
    showDescription: true,
    showEmploymentType: true,
    showLocationType: true,
    showDuration: true,
    showSkills: true,
    showCompanyName: true,
    showJobTitle: true,
    dateDisplayFormat: "month-year",
    cardOverrides: [],
    headline: "Work Experience",
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
