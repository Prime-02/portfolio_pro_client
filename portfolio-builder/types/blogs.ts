// portfolio-builder/types/blogs.ts

import type { BioAnimations } from "./bio";
import type { BioCTA } from "./bio";
import type { ContentFilterParams } from "@/lib/stores/contents/types/content.types";

// ---------------------------------------------------------------------------
// Blog card display options
// ---------------------------------------------------------------------------

export type BlogCardStyle =
  | "compact"
  | "standard"
  | "detailed"
  | "minimal"
  | "featured"
  | "magazine";

export type BlogsLayout =
  | "timeline"
  | "magazine-grid"
  | "newspaper"
  | "reading-list"
  | "featured-carousel";

export type BlogsSortBy =
  | "default"
  | "title-asc"
  | "title-desc"
  | "date-asc"
  | "date-desc"
  | "views-desc"
  | "likes-desc"
  | "comments-desc";

export type DateDisplay = "relative" | "absolute" | "hidden";
export type StatusDisplay = "badge" | "text" | "hidden";
export type ReactionDisplay = "icons" | "count" | "badge" | "hidden";

// ---------------------------------------------------------------------------
// Blog card override — style specific blogs differently
// ---------------------------------------------------------------------------

export interface BlogCardOverride {
  /** Which blogs this override applies to */
  target: {
    ids?: string[];
    categories?: string[];
    tags?: string[];
    statuses?: string[];
    content_types?: string[];
    is_featured?: boolean;
    is_pinned?: boolean;
  };
  /** Style to apply */
  style: BlogCardStyle;
  /** Custom accent color */
  accentColor?: string;
  /** Whether to show cover image */
  showImage?: boolean;
  /** Whether to show title */
  showTitle?: boolean;
  /** Whether to show excerpt */
  showExcerpt?: boolean;
  /** Whether to show body/content */
  showBody?: boolean;
  /** Whether to show author */
  showAuthor?: boolean;
  /** Whether to show dates */
  showDates?: boolean;
  /** Whether to show status */
  showStatus?: boolean;
  /** Whether to show tags */
  showTags?: boolean;
  /** Whether to show category */
  showCategory?: boolean;
  /** Whether to show reactions/likes */
  showReactions?: boolean;
  /** Whether to show comment count */
  showComments?: boolean;
  /** Whether to show view count */
  showViews?: boolean;
  /** Whether to show read time estimate */
  showReadTime?: boolean;
  /** Whether to show share button */
  showShare?: boolean;
  /** Whether to show bookmark button */
  showBookmark?: boolean;
  /** Whether to show content URL/link */
  showUrl?: boolean;
}

// ---------------------------------------------------------------------------
// Blogs filter configuration (public filters)
// ---------------------------------------------------------------------------

export interface BlogsFilterConfig extends ContentFilterParams {
  /** Optional sort override for renderer */
  _sortBy?: BlogsSortBy;
}

// ---------------------------------------------------------------------------
// Blogs data — saved in portfolio layout
// ---------------------------------------------------------------------------

export interface BlogsData {
  // ── Filters ──
  filters: BlogsFilterConfig;

  // ── Layout ──
  layout: BlogsLayout;
  alignment: "left" | "center" | "right";
  columns: number; // 1-4
  gap: "small" | "medium" | "large";
  maxWidth: number;
  padding?: { top?: number; bottom?: number };

  // ── Card styling ──
  cardStyle: BlogCardStyle;
  cardSize: "small" | "medium" | "large";
  showImage: boolean;
  showTitle: boolean;
  showExcerpt: boolean;
  showBody: boolean;
  showAuthor: boolean;
  showDates: boolean;
  dateDisplay: DateDisplay;
  showStatus: boolean;
  statusDisplay: StatusDisplay;
  showTags: boolean;
  showCategory: boolean;
  showReactions: boolean;
  reactionDisplay: ReactionDisplay;
  showComments: boolean;
  showViews: boolean;
  showReadTime: boolean;
  showShare: boolean;
  showBookmark: boolean;
  showUrl: boolean;
  cardOverrides: BlogCardOverride[];

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

export function getEmptyBlogsData(): BlogsData {
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
    showImage: true,
    showTitle: true,
    showExcerpt: true,
    showBody: false,
    showAuthor: true,
    showDates: true,
    dateDisplay: "relative",
    showStatus: true,
    statusDisplay: "badge",
    showTags: true,
    showCategory: true,
    showReactions: true,
    reactionDisplay: "icons",
    showComments: true,
    showViews: true,
    showReadTime: true,
    showShare: false,
    showBookmark: false,
    showUrl: true,
    cardOverrides: [],
    headline: "Latest Writings",
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
