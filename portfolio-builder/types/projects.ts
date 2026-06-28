// portfolio-builder/types/projects.ts

import { SectionBackgroundType } from "../components/shared/background";
import type { BioAnimations } from "./bio";
import type { BioCTA } from "./bio";

// ---------------------------------------------------------------------------
// Project card display options
// ---------------------------------------------------------------------------

export type ProjectCardStyle =
  | "compact"
  | "standard"
  | "detailed"
  | "minimal"
  | "hero";

export type ProjectsLayout =
  | "grid"
  | "masonry"
  | "horizontal-scroll"
  | "list"
  | "carousel";

export type ProjectsSortBy =
  | "default"
  | "name-asc"
  | "name-desc"
  | "date-asc"
  | "date-desc"
  | "status-asc"
  | "status-desc";

export type DateDisplay = "relative" | "absolute" | "hidden";
export type StatusDisplay = "badge" | "text" | "hidden";
export type PlatformDisplay = "icon" | "text" | "badge" | "hidden";
export type CategoryDisplay = "badge" | "text" | "hidden";

// ---------------------------------------------------------------------------
// Project card override — style specific projects differently
// ---------------------------------------------------------------------------

export interface ProjectCardOverride {
  /** Which projects this override applies to */
  target: {
    ids?: string[];
    categories?: string[];
    platforms?: string[];
    statuses?: string[];
    is_completed?: boolean;
    is_concept?: boolean;
  };
  /** Style to apply */
  style: ProjectCardStyle;
  /** Custom accent color */
  accentColor?: string;
  /** Whether to show project image */
  showImage?: boolean;
  /** Whether to show description */
  showDescription?: boolean;
  /** Whether to show project URL */
  showUrl?: boolean;
  /** Whether to show dates */
  showDates?: boolean;
  /** Whether to show status */
  showStatus?: boolean;
  /** Whether to show platform */
  showPlatform?: boolean;
  /** Whether to show category */
  showCategory?: boolean;
  /** Whether to show stack/tags */
  showStack?: boolean;
  /** Whether to show budget */
  showBudget?: boolean;
  /** Whether to show client name */
  showClient?: boolean;
  /** Whether to show contribution */
  showContribution?: boolean;
}

// ---------------------------------------------------------------------------
// Projects filter configuration (public filters)
// ---------------------------------------------------------------------------

export interface ProjectsFilterConfig {
  /** Hand-picked project IDs */
  ids?: string[];
  /** Filter by completion status */
  is_completed?: boolean;
  /** Filter by concept status */
  is_concept?: boolean;
  /** Filter by project category */
  project_category?: string;
  /** Filter by project platform */
  project_platform?: string;
  /** Filter by project status */
  project_status?: string;
  /** Merge multiple filters (AND vs OR logic) */
  merge_filters?: boolean;
  /** Optional sort override for renderer */
  _sortBy?: ProjectsSortBy;
}

// ---------------------------------------------------------------------------
// Projects data — saved in portfolio layout
// ---------------------------------------------------------------------------

export interface ProjectsData {
  // ── Filters ──
  filters: ProjectsFilterConfig;

  // ── Layout ──
  layout: ProjectsLayout;
  alignment: "left" | "center" | "right";
  columns: number; // 1-6
  gap: "small" | "medium" | "large";
  maxWidth: number;
  padding?: { top?: number; bottom?: number };

  // ── Card styling ──
  cardStyle: ProjectCardStyle;
  cardSize: "small" | "medium" | "large";
  showImage: boolean;
  showDescription: boolean;
  showUrl: boolean;
  showDates: boolean;
  dateDisplay: DateDisplay;
  showStatus: boolean;
  statusDisplay: StatusDisplay;
  showPlatform: boolean;
  platformDisplay: PlatformDisplay;
  showCategory: boolean;
  categoryDisplay: CategoryDisplay;
  showStack: boolean;
  showBudget: boolean;
  showClient: boolean;
  showContribution: boolean;
  cardOverrides: ProjectCardOverride[];

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

export function getEmptyProjectsData(): ProjectsData {
  return {
    filters: {},
    layout: "grid",
    alignment: "left",
    columns: 3,
    gap: "medium",
    maxWidth: 1200,
    padding: { top: 80, bottom: 80 },
    cardStyle: "standard",
    cardSize: "medium",
    showImage: true,
    showDescription: true,
    showUrl: true,
    showDates: true,
    dateDisplay: "relative",
    showStatus: true,
    statusDisplay: "badge",
    showPlatform: true,
    platformDisplay: "text",
    showCategory: true,
    categoryDisplay: "badge",
    showStack: true,
    showBudget: false,
    showClient: false,
    showContribution: false,
    cardOverrides: [],
    headline: "Featured Projects",
    subheadline: undefined,
    background: { type: "none" },
    animations: {
      preset: "fadeIn",
      duration: 0.5,
      delay: 0.1,
      easing: "easeOut",
      staggerChildren: true,
      staggerDelay: 0.08,
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
