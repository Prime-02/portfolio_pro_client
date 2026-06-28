// portfolio-builder/components/shared/background/editor/BackgroundTab.tsx

import type { SectionBackground, SectionBackgroundType } from "../types/sectionBackground";
import { PBDropdown } from "../../ui/inputs";
import {
  getAllBackgroundModules,
  getBackgroundModule,
  getDefaultsForType,
  supportsOverlay,
} from "./BackgroundRegistry";

// ── Import all background modules to trigger registration ─────────────────
// Each module calls registerBackground() as a side-effect on import.
// This is the ONLY place you add a new background import.
import "../backgrounds/none";
import "../backgrounds/solid";
import "../backgrounds/gradient";
import "../backgrounds/image";
import "../backgrounds/video";
import "../backgrounds/mesh";
import "../backgrounds/particles";
import "../backgrounds/aurora";
import "../backgrounds/balatro";
import "../backgrounds/ballpit";
import "../backgrounds/beams";
import "../backgrounds/colorBends";
import "../backgrounds/darkVeil";
import "../backgrounds/dither";
import "../backgrounds/dotField";
import "../backgrounds/dotGrid";
import "../backgrounds/antigravity";
import { AutoBackgroundFields } from "./AutoBackgroundFields";

interface BackgroundTabProps<T extends { background?: SectionBackground }> {
  data: T;
  onUpdate: (value: Partial<SectionBackground>) => void;
  /** Limit which background types are available */
  allowedTypes?: SectionBackgroundType[];
}

export default function BackgroundTab<T extends { background?: SectionBackground }>({
  data,
  onUpdate,
  allowedTypes,
}: BackgroundTabProps<T>) {
  const bg = data.background ?? { type: "none" as SectionBackgroundType };
  const type = bg.type || "none";

  // Resolve available modules, optionally filtered
  const allModules = getAllBackgroundModules();
  const modules = allowedTypes
    ? allModules.filter((m) => allowedTypes.includes(m.type))
    : allModules;

  const currentModule = getBackgroundModule(type);

  const handleTypeChange = (selectedValue: string | string[]) => {
    const newType = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
    if (newType && newType !== type) {
      onUpdate(getDefaultsForType(newType as SectionBackgroundType));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Type selector */}
      <div>
        <PBDropdown
          options={modules.map((m) => ({ id: m.type, code: m.label }))}
          onSelect={handleTypeChange}
          value={type}
          placeholder="Background Type"
          valueKey="id"
          displayKey="code"
          size="md"
          variant="outlined"
          className="w-full"
        />
      </div>

      {/* Auto-rendered fields for the selected background type */}
      {currentModule && (
        <AutoBackgroundFields module={currentModule} bg={bg} onUpdate={onUpdate} />
      )}

      {/* Shared overlay section */}
      {supportsOverlay(type) && (
        <OverlayFields bg={bg} onUpdate={onUpdate} />
      )}
    </div>
  );
}

// ── Overlay fields (shared across image/video/mesh/particles) ─────────────

function OverlayFields({
  bg,
  onUpdate,
}: {
  bg: SectionBackground;
  onUpdate: (v: Partial<SectionBackground>) => void;
}) {
  return (
    <div className="space-y-4 border-t border-[var(--pb-border)] pt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--pb-text-muted)]">
        Overlay
      </h4>
      <div>
        <label className="block text-xs text-[var(--pb-text-muted)] mb-1">Overlay Color</label>
        <div className="flex gap-2">
          {/* Reuse your ColorPicker here */}
          <input
            type="color"
            value={bg.overlayColor || "#0a0a0a"}
            onChange={(e) => onUpdate({ overlayColor: e.target.value })}
            className="w-10 h-10 rounded border border-[var(--pb-border)] cursor-pointer"
          />
          <input
            type="text"
            value={bg.overlayColor || "#0a0a0a"}
            onChange={(e) => onUpdate({ overlayColor: e.target.value })}
            className="flex-1 bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-xs text-[var(--pb-text-muted)]">Overlay Opacity</label>
          <span className="text-xs text-[var(--pb-text-muted)] tabular-nums">
            {bg.overlayOpacity ?? 0}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={bg.overlayOpacity ?? 0}
          onChange={(e) => onUpdate({ overlayOpacity: Number(e.target.value) })}
          className="w-full h-1.5 appearance-none bg-[var(--pb-foreground-20)] rounded-full accent-[#ffffff] cursor-pointer"
        />
      </div>
    </div>
  );
}
