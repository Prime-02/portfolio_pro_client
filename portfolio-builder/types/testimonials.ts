// portfolio-builder/types/testimonials.ts

import { SectionBackgroundType } from "../components/shared/background";
import type { BioAnimations } from "./bio";
import type { BioCTA } from "./bio";

// ---------------------------------------------------------------------------
// Testimonial card display options
// ---------------------------------------------------------------------------

export type TestimonialCardStyle =
  | "compact"
  | "standard"
  | "detailed"
  | "minimal"
  | "featured";

export type TestimonialsLayout =
  | "grid"
  | "masonry"
  | "marquee"
  | "list"
  | "slider";

export type TestimonialsSortBy =
  | "default"
  | "rating-desc"
  | "rating-asc"
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "name-desc";

export type DateDisplay = "relative" | "absolute" | "hidden";
export type RatingDisplay = "stars" | "number" | "badge" | "hidden";
export type AvatarDisplay = "circle" | "square" | "rounded" | "hidden";

// ---------------------------------------------------------------------------
// Public filter configuration
// ---------------------------------------------------------------------------

export interface PublicTestimonialsByUsernameFilters {
  username: string;
  skip?: number;
  limit?: number;
  is_featured?: boolean;
  author_company?: string;
  author_relationship?: string;
  rating?: number;
  ids?: string[];
  merge_filters?: boolean;
}

// ---------------------------------------------------------------------------
// Testimonial card override — style specific testimonials differently
// ---------------------------------------------------------------------------

export interface TestimonialCardOverride {
  /** Which testimonials this override applies to */
  target: {
    ids?: string[];
    companies?: string[];
    relationships?: string[];
    ratings?: number[];
    is_featured?: boolean;
  };
  /** Style to apply */
  style: TestimonialCardStyle;
  /** Custom accent color */
  accentColor?: string;
  /** Whether to show author avatar */
  showAvatar?: boolean;
  /** Whether to show author name */
  showAuthorName?: boolean;
  /** Whether to show author title */
  showAuthorTitle?: boolean;
  /** Whether to show author company */
  showAuthorCompany?: boolean;
  /** Whether to show author relationship */
  showAuthorRelationship?: boolean;
  /** Whether to show testimonial content */
  showContent?: boolean;
  /** Whether to show rating */
  showRating?: boolean;
  /** Whether to show date */
  showDate?: boolean;
  /** Whether to show featured badge */
  showFeaturedBadge?: boolean;

  avatarDisplay?: AvatarDisplay;
}

// ---------------------------------------------------------------------------
// Testimonials filter configuration (public filters)
// ---------------------------------------------------------------------------

export interface TestimonialsFilterConfig {
  /** Hand-picked testimonial IDs */
  ids?: string[];
  /** Filter by featured status */
  is_featured?: boolean;
  /** Filter by author company */
  author_company?: string;
  /** Filter by author relationship */
  author_relationship?: string;
  /** Filter by minimum rating */
  min_rating?: number;
  /** Merge multiple filters (AND vs OR logic) */
  merge_filters?: boolean;
  /** Optional sort override for renderer */
  _sortBy?: TestimonialsSortBy;
}

// ---------------------------------------------------------------------------
// Testimonials data — saved in portfolio layout
// ---------------------------------------------------------------------------

export interface TestimonialsData {
  // ── Filters ──
  filters: TestimonialsFilterConfig;

  // ── Layout ──
  layout: TestimonialsLayout;
  alignment: "left" | "center" | "right";
  columns: number; // 1-6
  gap: "small" | "medium" | "large";
  maxWidth: number;
  padding?: { top?: number; bottom?: number };

  // ── Card styling ──
  cardStyle: TestimonialCardStyle;
  cardSize: "small" | "medium" | "large";
  showAvatar: boolean;
  avatarDisplay: AvatarDisplay;
  showAuthorName: boolean;
  showAuthorTitle: boolean;
  showAuthorCompany: boolean;
  showAuthorRelationship: boolean;
  showContent: boolean;
  showRating: boolean;
  ratingDisplay: RatingDisplay;
  showDate: boolean;
  dateDisplay: DateDisplay;
  showFeaturedBadge: boolean;
  cardOverrides: TestimonialCardOverride[];

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

export function getEmptyTestimonialsData(): TestimonialsData {
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
    showAvatar: true,
    avatarDisplay: "circle",
    showAuthorName: true,
    showAuthorTitle: true,
    showAuthorCompany: true,
    showAuthorRelationship: false,
    showContent: true,
    showRating: true,
    ratingDisplay: "stars",
    showDate: false,
    dateDisplay: "relative",
    showFeaturedBadge: true,
    cardOverrides: [],
    headline: "What People Say",
    subheadline: "Testimonials from clients and colleagues",
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
