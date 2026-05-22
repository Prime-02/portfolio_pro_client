// portfolio-builder/components/sections/hero/renderer-components/backgroundUtils.ts

import type { HeroData } from "@/portfolio-builder/types/hero";

/**
 * Safely resolves gradientAngle to a number.
 * Guards against legacy data where the value was stored as a string like "135deg".
 */
function resolveAngle(raw: number | string | undefined): number {
  if (raw === undefined || raw === null) return 135;
  const n = typeof raw === "string" ? parseFloat(raw) : raw;
  return isNaN(n) ? 135 : n;
}

export function getBackgroundStyle(
  bg?: HeroData["background"],
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
      return {};

    default:
      return {};
  }
}
