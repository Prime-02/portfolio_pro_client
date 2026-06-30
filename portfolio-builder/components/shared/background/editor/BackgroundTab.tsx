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
import "../backgrounds/faultyTerminal";
import "../backgrounds/floatingLines";
import "../backgrounds/galaxy";
import "../backgrounds/gradientBlinds";
import "../backgrounds/gridScan";
import "../backgrounds/hyperspeed";
import "../backgrounds/laserFlow";
import "../backgrounds/letterGlitch";
import "../backgrounds/lightPillar";
import "../backgrounds/lightRays";
import "../backgrounds/lightfall";
import "../backgrounds/lineWaves";
import "../backgrounds/liquidChrome";
import "../backgrounds/liquidEther";
import "../backgrounds/noise";
import "../backgrounds/orb";
import "../backgrounds/particles";
import "../backgrounds/pixelBlast";
import "../backgrounds/pixelSnow";
import "../backgrounds/plasma";
import "../backgrounds/plasmaWave";
import "../backgrounds/prismaticBurst";
import "../backgrounds/prism";
import "../backgrounds/radar";
import "../backgrounds/rippleGrid";
import "../backgrounds/shapeGrid";
import "../backgrounds/sideRays";
import "../backgrounds/silk";
import "../backgrounds/softAurora";
import "../backgrounds/threads";
import "../backgrounds/waves";
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

  /** Reset current background to its module defaults */
  const handleReset = () => {
    if (currentModule) {
      onUpdate(getDefaultsForType(type));
    }
  };

  /** Randomize all configurable fields within their valid ranges */
  const handleRandomize = () => {
    if (!currentModule) return;

    const randomized: Partial<SectionBackground> = { type };

    for (const field of currentModule.fields) {
      switch (field.kind) {
        case "color": {
          // Generate a random hex color
          const hex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
          randomized[field.key as keyof SectionBackground] = hex as any;
          break;
        }
        case "slider": {
          const { min, max, step } = field;
          const steps = Math.floor((max - min) / step);
          const randomStep = Math.floor(Math.random() * (steps + 1));
          const val = min + randomStep * step;
          // Round to avoid floating point artifacts
          const decimals = step.toString().split(".")[1]?.length ?? 0;
          randomized[field.key as keyof SectionBackground] = Number(val.toFixed(decimals)) as any;
          break;
        }
        case "checkbox": {
          randomized[field.key as keyof SectionBackground] = Math.random() > 0.5 as any;
          break;
        }
        case "dropdown": {
          const randomOption = field.options[Math.floor(Math.random() * field.options.length)];
          randomized[field.key as keyof SectionBackground] = randomOption.id as any;
          break;
        }
        case "text": {
          // For text fields, keep the default or generate something simple
          // Most text fields are colors or special values - skip randomization
          break;
        }
        case "group": {
          for (const sub of field.fields) {
            if (sub.kind === "color") {
              const hex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
              randomized[sub.key as keyof SectionBackground] = hex as any;
            }
          }
          break;
        }
        case "custom":
          // Custom fields cannot be auto-randomized
          break;
      }
    }

    // Preserve overlay settings from current background
    if (bg.overlayColor !== undefined) randomized.overlayColor = bg.overlayColor;
    if (bg.overlayOpacity !== undefined) randomized.overlayOpacity = bg.overlayOpacity;

    onUpdate(randomized);
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
          type="datalist"
          includeNoneOption={false}
          includeQueryAsOption={false}
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

      {/* Action buttons */}
      {currentModule && type !== "none" && (
        <div className="flex gap-3 pt-2 border-t border-[var(--pb-border)]">
          <button
            onClick={handleRandomize}
            className="flex-1 px-4 py-2 bg-[var(--pb-accent)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            type="button"
          >
            Randomize
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-[var(--pb-foreground-10)] text-[var(--pb-text-secondary)] text-sm font-medium rounded-lg hover:bg-[var(--pb-foreground-20)] transition-colors"
            type="button"
          >
            Reset
          </button>
        </div>
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
