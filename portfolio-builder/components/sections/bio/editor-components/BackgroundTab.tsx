// portfolio-builder/components/sections/bio/editor-components/BackgroundTab.tsx

import { BioData, BioBackgroundType } from "@/portfolio-builder/types/bio";
import SelectField from "./SelectField";
import Field from "./Field";
import ColorPicker from "./ColorPicker";
import { sectionClass, sectionTitleClass } from "./styles";

interface BackgroundTabProps {
  data: BioData;
  onUpdate: (value: Partial<BioData["background"]>) => void;
}

const BACKGROUND_TYPE_OPTIONS: { value: BioBackgroundType; label: string }[] = [
  { value: "none", label: "None (transparent)" },
  { value: "solid", label: "Solid Color" },
  { value: "gradient", label: "Gradient" },
];

export default function BackgroundTab({ data, onUpdate }: BackgroundTabProps) {
  const bg = data.background;
  const type = bg?.type || "none";

  return (
    <div className="flex flex-col gap-5">
      <SelectField
        label="Background Type"
        id="bgType"
        value={type}
        onChange={(value) => onUpdate({ type: value as BioBackgroundType })}
        options={BACKGROUND_TYPE_OPTIONS}
      />

      {/* ── SOLID ─────────────────────────────────────────────── */}
      {type === "solid" && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Color</h3>
          <Field label="Background Color" htmlFor="bgColor">
            <ColorPicker
              id="bgColor"
              value={bg?.color || "#0a0a0a"}
              onChange={(value) => onUpdate({ color: value })}
              placeholder="#0a0a0a"
            />
          </Field>
        </div>
      )}

      {/* ── GRADIENT ──────────────────────────────────────────── */}
      {type === "gradient" && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Gradient</h3>

          {/* Live preview */}
          <div
            className="w-full h-10 rounded-lg border border-foreground/20"
            style={{
              background: `linear-gradient(${bg?.gradientAngle ?? 135}deg, ${bg?.gradientFrom || "#1a1a2e"}, ${bg?.gradientTo || "#0a0a0a"})`,
            }}
          />

          <Field label="From" htmlFor="gradFrom">
            <ColorPicker
              id="gradFrom"
              value={bg?.gradientFrom || "#1a1a2e"}
              onChange={(v) => onUpdate({ gradientFrom: v })}
              placeholder="#1a1a2e"
            />
          </Field>
          <Field label="To" htmlFor="gradTo">
            <ColorPicker
              id="gradTo"
              value={bg?.gradientTo || "#0a0a0a"}
              onChange={(v) => onUpdate({ gradientTo: v })}
              placeholder="#0a0a0a"
            />
          </Field>
          <Field label="Angle" htmlFor="gradAngle">
            <div className="flex items-center gap-3">
              <input
                id="gradAngle"
                type="range"
                min={0}
                max={360}
                step={1}
                value={bg?.gradientAngle ?? 135}
                onChange={(e) => onUpdate({ gradientAngle: Number(e.target.value) })}
                className="flex-1 h-1.5 appearance-none bg-foreground/20 rounded-full accent-foreground cursor-pointer"
              />
              <span className="text-sm text-foreground/70 tabular-nums w-12 text-right">
                {bg?.gradientAngle ?? 135}°
              </span>
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}