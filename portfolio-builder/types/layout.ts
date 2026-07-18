// portfolio-builder/types/layout.ts

// ---------------------------------------------------------------------------
// Layout Section — Type Definitions
// (Navbar, Footer, Page Background, Floating Elements)
// ---------------------------------------------------------------------------

import { PortfolioThemeData } from "../hooks/usePortfolioTheme";
import type { SectionBackground } from "../components/shared/background/types/sectionBackground";

// ---------------------------------------------------------------------------
// Shared Section Links (Navbar + Footer)
// ---------------------------------------------------------------------------

export type ScrollBehavior = "smooth" | "instant" | "auto";

export interface SectionLink {
  /** Section type identifier — e.g. "hero", "bio", "skills" */
  sectionType: string;
  /** Display label in nav/footer */
  label: string;
  /** Whether this section is visible on the page */
  visible: boolean;
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

export type NavbarLayout = "default" | "centered" | "minimal" | "sidebar";
export type NavbarPosition = "fixed" | "sticky" | "absolute" | "relative";
export type NavbarAlignment = "left" | "center" | "right";

export interface NavbarLink {
  label: string;
  /** Anchor target — e.g. "#hero", "#bio", "/blog" */
  href: string;
  openInNewTab?: boolean;
}

export interface NavbarCTA {
  label: string;
  href: string;
  openInNewTab?: boolean;
  /** If omitted, falls back to theme primary */
  bgColor?: string;
  textColor?: string;
}

export interface NavbarData {
  enabled: boolean;
  layout: NavbarLayout;
  position: NavbarPosition;
  alignment: NavbarAlignment;

  /** Logo / brand area */
  showLogo: boolean;
  logoType: "text" | "image";
  logoText?: string;
  logoImageUrl?: string;
  logoSize?: number; // px, default 32

  /** Navigation links — auto-populated from sections, shared with footer */
  sectionLinks: SectionLink[];

  /** Optional CTA button in the nav (legacy — use ctaButtons instead) */
  cta?: NavbarCTA;

  /** Multi CTA buttons in the nav (replaces cta) */
  ctaButtons?: import("./bio").BioCTA[];

  /** Whether to collapse links into a hamburger drawer on mobile */
  mobileMenu?: boolean;

  /** Scroll behavior for anchor links */
  scrollBehavior: ScrollBehavior;

  /** Visual */
  background?: SectionBackground;
  /** Blur-glass effect */
  blur?: boolean;
  borderBottom?: boolean;
  borderColor?: string;

  /** Padding */
  paddingX?: number; // px
  paddingY?: number; // px

  /** Margin */
  marginX?: number; // px
  marginY?: number; // px

  /** Border radius */
  borderRadius?: number; // px

  /** Show theme toggle button in navbar */
  showThemeToggle?: boolean;

  /** Colors */
  textColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export type FooterLayout =
  | "simple"
  | "columns"
  | "minimal"
  | "centered"
  | "branded"
  | "compact";

export interface FooterColumn {
  heading: string;
  links: { label: string; href: string; openInNewTab?: boolean }[];
}

export interface FooterSocialLink {
  platformId: string; // same platform IDs as hero social links
  url: string;
  useIconColor?: boolean;
}

export interface FooterData {
  enabled: boolean;
  layout: FooterLayout;

  /** Logo / brand area (like navbar) */
  showLogo?: boolean;
  logoType?: "text" | "image";
  logoText?: string;
  logoImageUrl?: string;
  logoSize?: number; // px, default 32

  /** Copyright text — supports {year} placeholder */
  copyrightText?: string;
  showYear?: boolean;

  /** Link columns (for "columns" layout) */
  columns?: FooterColumn[];

  /** Social icons row */
  showSocial?: boolean;
  socialLinks?: FooterSocialLink[];

  /** Extra tagline / bio blurb */
  tagline?: string;

  /** Visual */
  background?: SectionBackground;
  borderTop?: boolean;
  blur?: boolean;
  borderColor?: string;

  /** Padding */
  paddingX?: number;
  paddingY?: number;

  /** Show theme toggle button in footer */
  showThemeToggle?: boolean;

  /** Colors */
  textColor?: string;
  linkColor?: string;
  mutedColor?: string;
}

// ---------------------------------------------------------------------------
// Page Background
// (Applied behind all sections — lowest z-index layer)
// ---------------------------------------------------------------------------

export interface PageBackgroundData {
  enabled: boolean;
  background: SectionBackground;
}

// ---------------------------------------------------------------------------
// Root LayoutData
// ---------------------------------------------------------------------------

export interface LayoutData {
  navbar?: NavbarData;
  footer?: FooterData;
  pageBackground?: PageBackgroundData;
  theme?: PortfolioThemeData;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export function getEmptyNavbarData(): NavbarData {
  return {
    enabled: true,
    layout: "default",
    position: "fixed",
    alignment: "left",
    showLogo: true,
    logoType: "text",
    logoText: "Portfolio",
    logoSize: 32,
    sectionLinks: [],
    scrollBehavior: "smooth",
    blur: true,
    borderBottom: true,
    paddingX: 24,
    paddingY: 16,
    marginX: 0,
    marginY: 0,
    borderRadius: 0,
    background: { type: "none", color: "rgba(10,10,10,0.8)" },
    ctaButtons: [],
    mobileMenu: true,
    showThemeToggle: false,
  };
}

export function getEmptyFooterData(): FooterData {
  return {
    enabled: true,
    layout: "simple",
    showLogo: false,
    logoType: "text",
    logoText: "Portfolio",
    logoSize: 32,
    copyrightText: "© {year} All rights reserved.",
    showYear: true,
    showSocial: false,
    socialLinks: [],
    columns: [],
    borderTop: true,
    paddingX: 24,
    paddingY: 40,
    background: { type: "none", color: "#000000" },
    showThemeToggle: false,
  };
}

export function getEmptyPageBackgroundData(): PageBackgroundData {
  return {
    enabled: false,
    background: { type: "none" },
  };
}

export function getEmptyLayoutData(): LayoutData {
  return {
    navbar: getEmptyNavbarData(),
    footer: getEmptyFooterData(),
    pageBackground: getEmptyPageBackgroundData(),
  };
}

// ---------------------------------------------------------------------------
// Section Link Helpers
// ---------------------------------------------------------------------------

/** Default labels for known section types */
export const SECTION_LABELS: Record<string, string> = {
  hero: "Home",
  bio: "About",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  certification: "Certifications",
  projects: "Projects",
  blogs: "Blog",
  testimonials: "Testimonials",
};

/** Build initial section links from available section types */
export function buildSectionLinks(availableSections: string[]): SectionLink[] {
  return availableSections.map((sectionType) => ({
    sectionType,
    label: SECTION_LABELS[sectionType] ?? sectionType,
    visible: true,
  }));
}

/** Sync section links when sections change (add new, preserve existing order/visibility) */
export function syncSectionLinks(
  currentLinks: SectionLink[],
  availableSections: string[],
): SectionLink[] {
  const existingMap = new Map(currentLinks.map((l) => [l.sectionType, l]));
  const result: SectionLink[] = [];

  // Preserve existing order for sections that still exist
  for (const link of currentLinks) {
    if (availableSections.includes(link.sectionType)) {
      result.push(link);
    }
  }

  // Add new sections at the end
  for (const sectionType of availableSections) {
    if (!existingMap.has(sectionType)) {
      result.push({
        sectionType,
        label: SECTION_LABELS[sectionType] ?? sectionType,
        visible: true,
      });
    }
  }

  return result;
}
