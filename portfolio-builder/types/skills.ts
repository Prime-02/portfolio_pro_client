// portfolio-builder/types/skills.ts

import { SectionBackgroundType } from "../components/shared/background";
import type { BioAnimations } from "./bio";
import type { BioCTA } from "./bio";

// ---------------------------------------------------------------------------
// Skill card display options
// ---------------------------------------------------------------------------

export type SkillCardStyle =
  | "compact"
  | "standard"
  | "detailed"
  | "badge"
  | "progress";

export type SkillsLayout =
  | "grid"
  | "masonry"
  | "horizontal-scroll"
  | "list"
  | "carousel";

export type SkillsSortBy =
  | "default"
  | "name-asc"
  | "name-desc"
  | "proficiency-asc"
  | "proficiency-desc"
  | "difficulty-asc"
  | "difficulty-desc";

export type ProficiencyDisplay = "text" | "dots" | "bar" | "badge" | "hidden";

export type DifficultyDisplay = "text" | "badge" | "hidden";

// ---------------------------------------------------------------------------
// Skill card override — style specific skills differently
// ---------------------------------------------------------------------------

export interface SkillCardOverride {
  /** Which skills this override applies to */
  target: {
    ids?: string[];
    categories?: string[];
    subcategories?: string[];
    is_major?: boolean;
    difficulty_level?: string[];
  };
  /** Style to apply */
  style: SkillCardStyle;
  /** Custom accent color */
  accentColor?: string;
  /** Whether to show logo */
  showLogo?: boolean;
  /** Whether to show description */
  showDescription?: boolean;
  /** Whether to show proficiency */
  showProficiency?: boolean;
  /** Whether to show difficulty */
  showDifficulty?: boolean;
  /** Whether to show category badge */
  showCategory?: boolean;
}

// ---------------------------------------------------------------------------
// Skills filter configuration
// ---------------------------------------------------------------------------

export interface SkillsFilterConfig {
  /** Hand-picked skill IDs */
  ids?: string[];
  /** Filter by category */
  category?: string;
  /** Filter by subcategory */
  subcategory?: string;
  /** Filter by difficulty level */
  difficulty_level?: string;
  /** Only show major skills */
  is_major?: boolean;
  /** Merge multiple filters (AND vs OR logic) */
  merge_filters?: boolean;
  /** Optional sort override for renderer (uses `SkillsSortBy`) */
  _sortBy?: SkillsSortBy;
}

// ---------------------------------------------------------------------------
// Skills data — saved in portfolio layout
// ---------------------------------------------------------------------------

export interface SkillsData {
  // ── Filters ──
  filters: SkillsFilterConfig;

  // ── Layout ──
  layout: SkillsLayout;
  alignment: "left" | "center" | "right";
  columns: number; // 1-6
  gap: "small" | "medium" | "large";
  maxWidth: number;
  padding?: { top?: number; bottom?: number };

  // ── Card styling ──
  cardStyle: SkillCardStyle;
  cardSize: "small" | "medium" | "large";
  showLogo: boolean;
  showDescription: boolean;
  showProficiency: boolean;
  proficiencyDisplay: ProficiencyDisplay;
  showDifficulty: boolean;
  difficultyDisplay: DifficultyDisplay;
  showCategory: boolean;
  cardOverrides: SkillCardOverride[];

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

export function getEmptySkillsData(): SkillsData {
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
    showLogo: true,
    showDescription: true,
    showProficiency: true,
    proficiencyDisplay: "dots",
    showDifficulty: false,
    difficultyDisplay: "badge",
    showCategory: true,
    cardOverrides: [],
    headline: "Skills & Expertise",
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
