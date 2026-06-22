// portfolio-builder/types/bio.ts

// ---------------------------------------------------------------------------
// Bio Section — Type Definitions
// ---------------------------------------------------------------------------

import type { SectionBackground } from "./sectionBackground";
import type { HeroAnimations } from "./hero";

/**
 * Available layout options for the bio section.
 */
export type BioLayout =
  | "standard"
  | "split"
  | "magazine"
  | "featured"
  | "sidebar"
  | "minimal"
  | "bento"
  | "showcase";

/**
 * Horizontal alignment of the bio content.
 */
export type BioAlignment = "left" | "center";

/**
 * Vertical spacing for the section.
 */
export type BioSpacing = "tight" | "normal" | "loose";

// ---------------------------------------------------------------------------
// Bio Content Fields
// ---------------------------------------------------------------------------

/**
 * Status indicator for availability.
 */
export type AvailabilityStatus =
  | "open-to-work"
  | "freelancing"
  | "hiring"
  | "not-available"
  | "open-to-collaborate";

export interface BioStatus {
  type: AvailabilityStatus;
  label?: string; // Custom label override (e.g., "Available for Q3 projects")
}

/**
 * Language proficiency.
 */
export interface BioLanguage {
  language: string;
  proficiency: "native" | "fluent" | "conversational" | "basic";
}

/**
 * A single contact method.
 */
export interface BioContact {
  type: "email" | "phone" | "website" | "calendly";
  value: string;
  label?: string;
  isPrimary?: boolean;
}

// ---------------------------------------------------------------------------
// Background (uses shared SectionBackground)
// ---------------------------------------------------------------------------

/** Re-export for backward compatibility. Prefer SectionBackground in new code. */
export type BioBackground = SectionBackground;
export type BioBackgroundType = SectionBackground["type"];

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export interface BioTypography {
  /** Font size in pixels */
  size?: number;
  /** Font weight 100–900 */
  weight?: number;
  /** Line height multiplier */
  lineHeight?: number;
  /** Letter spacing in pixels */
  letterSpacing?: number;
  /** Transform: none, uppercase, lowercase, capitalize */
  transform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface BioFieldTypography {
  headline?: BioTypography;
  bio?: BioTypography;
  location?: BioTypography;
  status?: BioTypography;
  metadata?: BioTypography;
}

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

export interface BioFonts {
  headline?: string;
  bio?: string;
  location?: string;
  metadata?: string;
}

// ---------------------------------------------------------------------------
// Animations (reuses HeroAnimations pattern)
// ---------------------------------------------------------------------------

export type BioAnimations = HeroAnimations;

// ---------------------------------------------------------------------------
// CTA (Call-to-Action)
// ---------------------------------------------------------------------------

/**
 * Visual style variants for call-to-action buttons.
 */
export type CTAVariant = "primary" | "secondary" | "outline" | "ghost" | "link";

/**
 * Optional color overrides for a CTA button.
 * Applied as inline styles on top of the variant's default Tailwind classes.
 */
export interface CTAColorOverride {
  /** Background color — CSS value (hex, rgb, etc.) */
  bg?: string;
  /** Text color */
  text?: string;
  /** Border color — most relevant for outline variant */
  border?: string;
}

/**
 * A call-to-action button for the bio section.
 */
export interface BioCTA {
  /** Button text */
  label: string;
  /** Where the button links to */
  url: string;
  /** Visual style */
  variant: CTAVariant;
  /** Optional icon name (e.g. from Lucide, or an emoji) */
  icon?: string;
  /** Whether to open the link in a new tab */
  openInNewTab?: boolean;
  /** Optional theme color overrides — applied on top of the variant defaults */
  colorOverride?: CTAColorOverride;
}

// ---------------------------------------------------------------------------
// The Main Bio Data Shape
// ---------------------------------------------------------------------------

/**
 * Complete data shape for a bio / about section.
 */
export interface BioData {
  // -- Layout --
  layout: BioLayout;
  alignment?: BioAlignment;
  spacing?: BioSpacing;
  maxWidth?: number; // px, default 800
  padding?: {
    top?: number;
    bottom?: number;
  };

  // -- Content --
  /** Short punchy headline (e.g., "Building digital experiences for 8 years") */
  headline?: string;
  /** Long-form bio / description */
  bio?: string;
  /** Geographic location */
  location?: string;
  /** Years of experience */
  yearsExperience?: number;
  /** Current availability status */
  status?: BioStatus;
  /** Spoken/written languages */
  languages?: BioLanguage[];
  /** Contact methods */
  contacts?: BioContact[];
  /** Fun facts or additional metadata (key-value pairs) */
  metadata?: { key: string; value: string }[];

  // -- Background --
  /** Background configuration (uses shared SectionBackground) */
  background?: SectionBackground;

  // -- Typography --
  fonts?: BioFonts;
  typography?: BioFieldTypography;

  // -- Animations --
  animations?: BioAnimations;

  // -- CTA --
  /** Optional CTA at the bottom of the bio */
  ctaButtons?: BioCTA[];
}

// ---------------------------------------------------------------------------
// Defaults Factory
// ---------------------------------------------------------------------------

export function getEmptyBioData(): BioData {
  return {
    layout: "standard",
    alignment: "left",
    spacing: "normal",
    maxWidth: 800,
    padding: { top: 80, bottom: 80 },
    headline: "",
    bio: "",
    location: "",
    yearsExperience: 0,
    status: { type: "open-to-work" },
    languages: [],
    contacts: [],
    metadata: [],
    background: { type: "none" },
    fonts: {},
    typography: {},
  };
}

/**
 * Seeds bio data from a user profile.
 */
export function getDefaultBioData(userProfile?: {
  bio?: string | null;
  location?: string | null;
  headline?: string | null;
  yearsExperience?: number | null;
}): BioData {
  return {
    layout: "standard",
    alignment: "left",
    spacing: "normal",
    maxWidth: 800,
    padding: { top: 80, bottom: 80 },
    headline: userProfile?.headline ?? "",
    bio: userProfile?.bio ?? "",
    location: userProfile?.location ?? "",
    yearsExperience: userProfile?.yearsExperience ?? 0,
    status: { type: "open-to-work" },
    languages: [],
    contacts: [],
    metadata: [],
    background: { type: "none" },
    fonts: {},
    typography: {},
  };
}
