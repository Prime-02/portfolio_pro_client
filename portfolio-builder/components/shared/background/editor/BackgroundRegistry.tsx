// portfolio-builder/components/shared/background/editor/BackgroundRegistry.ts

import type { SectionBackground, SectionBackgroundType } from "../types/sectionBackground";
import type { ReactNode } from "react";

/**
 * Field descriptor for a single configurable property of a background.
 * The registry uses these to auto-generate the editor UI.
 */
export type FieldType =
  | { kind: "color"; label: string; key: string; defaultValue: string }
  | { kind: "image"; label: string; key: string; defaultValue: string }
  | { kind: "slider"; label: string; key: string; defaultValue: number; min: number; max: number; step: number; unit?: string }
  | { kind: "text"; label: string; key: string; defaultValue: string; placeholder?: string }
  | { kind: "checkbox"; label: string; key: string; defaultValue: boolean }
  | { kind: "dropdown"; label: string; key: string; defaultValue: string; options: { id: string; code: string }[] }
  | { kind: "group"; label: string; fields: FieldType[] }
  | { kind: "custom"; label: string; render: (bg: SectionBackground, onUpdate: (v: Partial<SectionBackground>) => void) => ReactNode };

/**
 * Background module configuration.
 * Each background type exports one of these from its index.ts.
 */
export interface BackgroundModule {
  /** Unique identifier — must match SectionBackgroundType */
  type: SectionBackgroundType;
  /** Human-readable label shown in the type selector */
  label: string;
  /** Ordered list of fields that define this background's editor UI */
  fields: FieldType[];
  /** Default values when this background type is selected */
  defaults: Partial<SectionBackground>;
  /**
   * Optional: if the background needs a dedicated React component
   * (mesh, particles, video), provide it here.
   * Return null if the background is pure CSS (solid, gradient, image).
   */
  renderer?: React.FC<{ background: SectionBackground }>;
  /**
   * Optional: custom CSS properties to merge into the container style.
   * Used for solid, gradient, image backgrounds.
   */
  getStyle?: (bg: SectionBackground) => React.CSSProperties;
  /** Whether this background supports an overlay layer */
  supportsOverlay: boolean;
}

// ── Registry ──────────────────────────────────────────────────────────────

const registry = new Map<SectionBackgroundType, BackgroundModule>();

/** Register a new background module. Call this in each background's index.ts */
export function registerBackground(module: BackgroundModule) {
  registry.set(module.type, module);
}

/** Retrieve a registered background module by type */
export function getBackgroundModule(type: SectionBackgroundType): BackgroundModule | undefined {
  return registry.get(type);
}

/** Get all registered modules (for populating the type dropdown) */
export function getAllBackgroundModules(): BackgroundModule[] {
  return Array.from(registry.values());
}

/** Get default values for a given background type */
export function getDefaultsForType(type: SectionBackgroundType): Partial<SectionBackground> {
  return getBackgroundModule(type)?.defaults ?? { type };
}

/** Check if a background type supports overlay */
export function supportsOverlay(type: SectionBackgroundType): boolean {
  return getBackgroundModule(type)?.supportsOverlay ?? false;
}

/** Get the renderer component for a background type, if any */
export function getBackgroundRenderer(type: SectionBackgroundType): React.FC<{ background: SectionBackground }> | undefined {
  return getBackgroundModule(type)?.renderer;
}

/** Get CSS style for a background type */
export function getBackgroundStyle(type: SectionBackgroundType, bg: SectionBackground): React.CSSProperties {
  const mod = getBackgroundModule(type);
  if (mod?.getStyle) {
    return mod.getStyle(bg);
  }
  return {};
}
