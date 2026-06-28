// portfolio-builder/components/shared/background/lib/sectionBackground.ts

import type { SectionBackground, SectionBackgroundType } from "../types/sectionBackground";
import {
  getBackgroundStyle as getRegisteredStyle,
  supportsOverlay as registeredSupportsOverlay,
} from "../editor/BackgroundRegistry";

/**
 * @deprecated Use the registry-based getBackgroundStyle from BackgroundRegistry instead.
 * Kept for backward compatibility with existing callers.
 */
export function getBackgroundStyle(bg?: SectionBackground): React.CSSProperties {
  if (!bg) return {};
  return getRegisteredStyle(bg.type, bg);
}

/**
 * @deprecated Use supportsOverlay from BackgroundRegistry instead.
 */
export function supportsOverlay(type: SectionBackgroundType): boolean {
  return registeredSupportsOverlay(type);
}

/**
 * @deprecated All backgrounds are now handled by the registry.
 */
export function needsDedicatedBackground(type: SectionBackgroundType): boolean {
  return ["mesh", "particles", "video"].includes(type);
}

// Re-export types for convenience
export type { SectionBackground, SectionBackgroundType, GradientType } from "../types/sectionBackground";
