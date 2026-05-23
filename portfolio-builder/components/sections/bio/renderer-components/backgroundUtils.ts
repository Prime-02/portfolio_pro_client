// portfolio-builder/components/sections/bio/renderer-components/backgroundUtils.ts

import type { BioData } from "@/portfolio-builder/types/bio";

export function getBackgroundStyle(
  bg?: BioData["background"],
): React.CSSProperties {
  if (!bg) return {};

  switch (bg.type) {
    case "solid":
      return { backgroundColor: bg.color || "transparent" };

    case "gradient": {
      const from = bg.gradientFrom || "#1a1a2e";
      const to = bg.gradientTo || "#0a0a0a";
      const angle = bg.gradientAngle ?? 135;
      return { background: `linear-gradient(${angle}deg, ${from}, ${to})` };
    }

    case "none":
    default:
      return {};
  }
}
