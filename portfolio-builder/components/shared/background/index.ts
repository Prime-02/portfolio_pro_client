// portfolio-builder/components/shared/background/index.ts

/**
 * Portfolio Builder — Background System
 *
 * Import this file to register all background types and access the public API.
 *
 *   import { BackgroundTab, SectionBackgroundRenderer } from "@/portfolio-builder/components/shared/background";
 *
 * To add a new background:
 *   1. Create a folder under backgrounds/<name>/
 *   2. Export a module config from backgrounds/<name>/index.ts
 *   3. Import it in backgrounds/index.ts and editor/BackgroundTab
 */

// Register all backgrounds (side-effect)
import "./backgrounds";

// Public API
export { default as BackgroundTab } from "./editor/BackgroundTab";
export { SectionBackgroundRenderer } from "./renderer/SectionBackground";
export {
  registerBackground,
  getBackgroundModule,
  getAllBackgroundModules,
  getDefaultsForType,
  supportsOverlay,
  getBackgroundRenderer,
  getBackgroundStyle,
  type BackgroundModule,
  type FieldType,
} from "./editor/BackgroundRegistry";
export {
  AutoBackgroundFields,
  ColorField,
  SliderField,
  TextField,
  CheckboxField,
} from "./editor/AutoBackgroundFields";

// Types
export type {
  SectionBackground,
  SectionBackgroundType,
  GradientType,
} from "./types/sectionBackground";
