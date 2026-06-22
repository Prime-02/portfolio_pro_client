// portfolio-builder/lib/sectionBackground.ts

import type {
  SectionBackground,
  GradientType,
  SectionBackgroundType,
} from "@/portfolio-builder/types/sectionBackground";

/**
 * Safely resolves gradientAngle to a number.
 * Guards against legacy data where the value was stored as a string like "135deg".
 */
function resolveAngle(raw: number | string | undefined): number {
  if (raw === undefined || raw === null) return 135;
  const n = typeof raw === "string" ? parseFloat(raw) : raw;
  return isNaN(n) ? 135 : n;
}

/**
 * Builds CSS background styles from a SectionBackground config.
 * Returns an object suitable for spreading into a style prop.
 *
 * For animated backgrounds (mesh, particles, video), returns an empty object
 * since those are rendered by dedicated components.
 */
export function getBackgroundStyle(
  bg?: SectionBackground,
): React.CSSProperties {
  if (!bg) return {};

  switch (bg.type) {
    case "solid":
      return { backgroundColor: bg.color || "#0a0a0a" };

    case "gradient": {
      const from = bg.gradientFrom || "#1a1a2e";
      const to = bg.gradientTo || "#0a0a0a";
      const angle = resolveAngle(bg.gradientAngle);
      const position = bg.radialPosition || "center";
      const gradientCSS =
        bg.gradientType === "radial"
          ? `radial-gradient(circle at ${position}, ${from}, ${to})`
          : `linear-gradient(${angle}deg, ${from}, ${to})`;
      return { background: gradientCSS };
    }

    case "image":
      return bg.imageUrl
        ? {
            backgroundImage: `url(${bg.imageUrl})`,
            backgroundSize: bg.backgroundSize || "cover",
            backgroundPosition: bg.backgroundPosition || "center",
            backgroundRepeat: bg.backgroundRepeat ? "repeat" : "no-repeat",
          }
        : {};

    case "mesh":
    case "particles":
    case "video":
    case "none":
    default:
      return {};
  }
}

/**
 * Determines if a background type supports an overlay.
 */
export function supportsOverlay(type: SectionBackgroundType): boolean {
  return ["image", "video", "mesh", "particles"].includes(type);
}

/**
 * Builds overlay CSS styles if applicable.
 */
export function getOverlayStyle(
  bg?: SectionBackground,
): React.CSSProperties | null {
  if (!bg || !supportsOverlay(bg.type)) return null;

  const opacity = bg.overlayOpacity ?? 0;
  if (opacity <= 0) return null;

  return {
    backgroundColor: bg.overlayColor || "var(--pb-background)",
    opacity: opacity / 100,
  };
}

/**
 * Type guard: checks if background type requires a dedicated component.
 */
export function needsDedicatedBackground(type: SectionBackgroundType): boolean {
  return ["mesh", "particles", "video"].includes(type);
}
