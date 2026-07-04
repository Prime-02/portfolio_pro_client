// types/hero.ts

// ---------------------------------------------------------------------------
// Hero Section — Type Definitions
// ---------------------------------------------------------------------------

import type { SectionBackground } from "../components/shared/background/types/sectionBackground";

/**
 * Available layout options for the hero section.
 * - centered : Everything in the middle, stacked vertically
 * - split    : Two columns — text on one side, media on the other
 * - minimal  : Barebones — just name and title, left or center aligned
 */
export type HeroLayout = "centered" | "split" | "minimal";

/**
 * Where the content sits horizontally within the section.
 * Only applies to layouts where it makes sense (centered, minimal).
 */
export type HeroAlignment = "left" | "center" | "right";

/**
 * How tall the hero section is.
 * - auto       : Height based on content
 * - screen     : Full viewport height (100vh)
 * - min-screen : At least full viewport, grows if content overflows
 */
export type HeroHeight = "auto" | "screen" | "min-screen";

/**
 * Position of the media element in split layout.
 * - left  : Media on the left, text on the right
 * - right : Media on the right, text on the left (default)
 */
export type HeroMediaPosition = "left" | "right";

/**
 * Vertical alignment of the content within the hero section.
 * Particularly useful with screen / min-screen heights.
 */
export type HeroVerticalAlignment = "top" | "center" | "bottom";

/**
 * Symmetric padding applied to the top and bottom of the hero section.
 * Values are in pixels.
 */
export interface HeroPadding {
  top?: number;
  bottom?: number;
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

/**
 * The type of visual media to display alongside or behind the hero text.
 */
export type HeroMediaType = "image" | "lottie" | "video" | "none";

/**
 * Shape of the media element.
 * - circle        : Fully rounded (classic avatar style)
 * - rounded       : Rounded rectangle
 * - square        : No border radius
 */
export type HeroMediaShape =
  | "circle"
  | "rounded"
  | "square"
  | "portrait"
  | "landscape";

/**
 * Display size of the media element.
 * - sm : Small — suits minimal/centered layouts with a subtle presence
 * - md : Medium — default for centered layout
 * - lg : Large — default for split layout
 */
export type HeroMediaSize = "sm" | "md" | "lg";

/**
 * Configuration for the media element in the hero.
 */
export interface HeroMedia {
  /** Which type of media to show */
  type: HeroMediaType;
  /** URL for profile image (when type = "image") */
  imageUrl?: string;
  /** Alt text for the profile image */
  imageAlt?: string;
  /** URL to a Lottie JSON file (when type = "lottie") */
  lottieUrl?: string;
  /** URL to a video file (when type = "video") */
  videoUrl?: string;
  /** Shape of the media element */
  shape?: HeroMediaShape;
  /** Display size of the media element */
  size?: HeroMediaSize;
}

// ---------------------------------------------------------------------------
// Background (uses shared SectionBackground)
// ---------------------------------------------------------------------------

/** Re-export for backward compatibility. Prefer SectionBackground in new code. */
export type HeroBackground = SectionBackground;
export type HeroBackgroundType = SectionBackground["type"];
export type HeroGradientType = "linear" | "radial";
export type HeroBackgroundSize = "cover" | "contain" | "auto";
export type HeroBackgroundPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top left"
  | "top right"
  | "bottom left"
  | "bottom right";

// ---------------------------------------------------------------------------
// CTA Buttons
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
 * A single call-to-action button.
 */
export interface HeroCTA {
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
// Effects & Extras
// ---------------------------------------------------------------------------

/**
 * Visual effects and optional elements for the hero.
 */
export interface HeroEffects {
  /** Whether the title should have a typewriter animation */
  typewriter?: boolean;
  /** Speed of the typewriter effect in ms per character */
  typewriterSpeed?: number;
  /** Whether to show a scroll-down indicator at the bottom */
  scrollIndicator?: boolean;
}

export interface SocialLink {
  platformId: string; // matches the `id` from socialMediaPlatforms
  url: string;
  useIconColor?: boolean; // whether to color the icon with the platform's brand color
}

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

/**
 * Per-field font family overrides.
 * Each value is a Google Fonts family name, e.g. "Playfair Display".
 * Omitting a field (or setting it to "") falls back to the theme default.
 */
export interface HeroFonts {
  greeting?: string;
  name?: string;
  title?: string;
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export interface HeroTypography {
  /** Font size in pixels (e.g. 48) */
  size?: number;
  /** Font weight 100–900 (e.g. 700) */
  weight?: number;
  /** Line height multiplier (e.g. 1.2) */
  lineHeight?: number;
  /** Letter spacing in pixels (e.g. -0.5) */
  letterSpacing?: number;
  /** Transform: none, uppercase, lowercase, capitalize */
  transform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface HeroFieldTypography {
  /** Per-field typography overrides */
  greeting?: HeroTypography;
  name?: HeroTypography;
  title?: HeroTypography;
  cta?: HeroTypography;
}

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

export type AnimationPreset =
  | "none"
  | "fadeIn"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "scaleDown"
  | "blurIn"
  | "rotateIn"
  | "flipUp"
  | "bounceIn";

export type AnimationEasing =
  | "easeOut"
  | "easeIn"
  | "easeInOut"
  | "linear"
  | "spring"
  | "anticipate";

export type HoverEffect = "none" | "lift" | "scale" | "glow" | "tilt";

export interface HeroAnimations {
  // Entrance
  preset: AnimationPreset;
  duration: number; // seconds, e.g. 0.6
  delay: number; // initial delay in seconds
  easing: AnimationEasing;

  // Stagger
  staggerChildren: boolean;
  staggerDelay: number; // seconds between each child

  // Scroll trigger
  scrollTrigger: boolean; // animate when scrolled into view
  scrollOnce: boolean; // only animate once vs every time

  // Parallax
  parallax: boolean;
  parallaxIntensity: number; // 0–100, how much elements shift on scroll

  // Hover
  hoverEffect: HoverEffect;
  hoverScale: number; // e.g. 1.03

  // Text-specific
  textReveal: boolean; // clip-mask text reveal
  textRevealDelay: number; // extra delay before text reveals
}

// ---------------------------------------------------------------------------
// The Main Hero Data Shape
// ---------------------------------------------------------------------------

/**
 * Complete data shape for a hero section.
 * Every field is optional except `layout` — the renderer handles
 * missing fields gracefully with sensible defaults.
 */
export interface HeroData {
  // -- Layout --
  /** How the hero is structured */
  layout: HeroLayout;
  /** Horizontal alignment of text content */
  alignment?: HeroAlignment;
  /** Vertical alignment of content within the section */
  verticalAlignment?: HeroVerticalAlignment;
  /** Overall height of the section */
  height?: HeroHeight;
  /** Position of media in split layout (left or right of text) */
  mediaPosition?: HeroMediaPosition;
  /** Top/bottom padding for the section in pixels */
  padding?: HeroPadding;

  // -- Content --
  /** The person's name (or main headline) */
  name?: string;
  /** A short greeting shown above the name */
  greeting?: string;
  /** Role, tagline, or short descriptor */
  title?: string;

  // -- Media --
  /** Visual media (profile image, animation, video) */
  media?: HeroMedia;

  // -- Buttons --
  /** One or more call-to-action buttons */
  ctaButtons?: HeroCTA[];

  // -- Background --
  /** Background configuration (uses shared SectionBackground) */
  background?: SectionBackground;

  // -- Effects --
  /** Visual effects and optional elements */
  effects?: HeroEffects;

  // -- Animations --
  /** Entrance, scroll, parallax, and hover animation configuration */
  animations?: HeroAnimations;

  // -- Social --
  socialLinks?: SocialLink[];

  // -- Fonts --
  fonts?: HeroFonts;

  // -- Typography --
  typography?: HeroFieldTypography;
}

// ---------------------------------------------------------------------------
// Defaults Factory
// ---------------------------------------------------------------------------

export function getDefaultAnimations(): HeroAnimations {
  return {
    preset: "fadeIn",
    duration: 0.6,
    delay: 0.1,
    easing: "easeOut",
    staggerChildren: true,
    staggerDelay: 0.12,
    scrollTrigger: false,
    scrollOnce: true,
    parallax: false,
    parallaxIntensity: 20,
    hoverEffect: "none",
    hoverScale: 1.03,
    textReveal: false,
    textRevealDelay: 0.2,
  };
}

/**
 * Returns a minimal hero data object with sensible defaults.
 * Used when creating a brand new portfolio from scratch (no user data to seed).
 */
export function getEmptyHeroData(): HeroData {
  return {
    layout: "centered",
    alignment: "center",
    verticalAlignment: "center",
    height: "screen",
    mediaPosition: "right",
    padding: { top: 0, bottom: 0 },
    name: "",
    title: "",
    background: {
      type: "solid",
      color: "#0a0a0a",
    },
    effects: {
      typewriter: false,
      typewriterSpeed: 50,
      scrollIndicator: true,
    },
    animations: getDefaultAnimations(),
  };
}

/**
 * Seeds a hero data object from a user's profile.
 * The store data is copied once — no live binding.
 *
 * @param userProfile - The user object from your user/social store
 * @returns A populated HeroData object ready for the editor
 */
export function getDefaultHeroData(userProfile?: {
  name?: string | null;
  headline?: string | null;
  bio?: string | null;
  avatar?: string | null;
}): HeroData {
  return {
    layout: "centered",
    alignment: "center",
    height: "screen",
    name: userProfile?.name ?? "",
    title: userProfile?.headline ?? "",
    media: userProfile?.avatar
      ? {
          type: "image",
          imageUrl: userProfile.avatar,
          imageAlt: userProfile?.name ?? "Profile photo",
        }
      : { type: "none" },
    background: {
      type: "solid",
      color: "#0a0a0a",
    },
    effects: {
      typewriter: false,
      typewriterSpeed: 50,
      scrollIndicator: true,
    },
  };
}
