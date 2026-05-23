// portfolio-builder/components/sections/bio/editor-components/LayoutTab.tsx

import { BioData, BioLayout, BioAlignment, BioSpacing } from "@/portfolio-builder/types/bio";
import SelectField from "./SelectField";
import SliderField from "./SliderField";
import { sectionClass, sectionTitleClass } from "./styles";

interface LayoutTabProps {
  data: BioData;
  onChange: <K extends keyof BioData>(key: K, value: BioData[K]) => void;
}

// ---------------------------------------------------------------------------
// Option definitions
// ---------------------------------------------------------------------------

const LAYOUT_OPTIONS: {
  value: BioLayout;
  label: string;
  description: string;
  preview: React.ReactNode;
}[] = [
  {
    value: "standard",
    label: "Standard",
    description: "Full-width content with clean spacing",
    preview: (
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="6" y="5" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
        <rect x="6" y="11" width="36" height="2" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="6" y="15" width="28" height="2" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="6" y="19" width="32" height="2" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="6" y="23" width="20" height="2" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    value: "compact",
    label: "Compact",
    description: "Narrower, more condensed layout",
    preview: (
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="10" y="6" width="28" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
        <rect x="10" y="12" width="28" height="2" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="10" y="16" width="24" height="2" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="10" y="20" width="20" height="2" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    value: "card",
    label: "Card",
    description: "Contained card with distinct background",
    preview: (
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="4" y="3" width="40" height="26" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
        <rect x="10" y="8" width="28" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
        <rect x="10" y="14" width="28" height="2" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="10" y="18" width="20" height="2" rx="1" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
];

const ALIGNMENT_OPTIONS: { value: BioAlignment; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
];

const SPACING_OPTIONS: { value: BioSpacing; label: string }[] = [
  { value: "tight", label: "Tight" },
  { value: "normal", label: "Normal" },
  { value: "loose", label: "Loose" },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LayoutTab({ data, onChange }: LayoutTabProps) {
  const handlePaddingChange = (side: "top" | "bottom", value: number) => {
    onChange("padding", { ...data.padding, [side]: value });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Layout picker ─────────────────────────────────────── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Layout Style</h3>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUT_OPTIONS.map(({ value, label, description, preview }) => {
            const active = data.layout === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange("layout", value)}
                className={[
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-3",
                  "transition-all duration-150 focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/60",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-foreground/50 hover:bg-muted/40",
                ].join(" ")}
              >
                <div className="h-10 w-full">{preview}</div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span className={["text-xs font-semibold", active ? "text-primary" : "text-foreground"].join(" ")}>
                    {label}
                  </span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Alignment ─────────────────────────────────────────── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Alignment</h3>
        <SelectField
          label="Horizontal Alignment"
          id="alignment"
          value={data.alignment ?? "left"}
          onChange={(value) => onChange("alignment", value as BioAlignment)}
          options={ALIGNMENT_OPTIONS}
        />
      </div>

      {/* ── Spacing ───────────────────────────────────────────── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Spacing</h3>
        <SelectField
          label="Content Spacing"
          id="spacing"
          value={data.spacing ?? "normal"}
          onChange={(value) => onChange("spacing", value as BioSpacing)}
          options={SPACING_OPTIONS}
        />
      </div>

      {/* ── Max Width ─────────────────────────────────────────── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Content Width</h3>
        <SliderField
          label="Max Width"
          htmlFor="maxWidth"
          value={data.maxWidth ?? 800}
          min={400}
          max={1200}
          step={50}
          unit="px"
          onChange={(v) => onChange("maxWidth", v)}
        />
      </div>

      {/* ── Padding ───────────────────────────────────────────── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Section Padding</h3>
        <div className="grid grid-cols-2 gap-3">
          <SliderField
            label="Top"
            htmlFor="paddingTop"
            value={data.padding?.top ?? 80}
            min={0}
            max={200}
            step={10}
            unit="px"
            onChange={(v) => handlePaddingChange("top", v)}
          />
          <SliderField
            label="Bottom"
            htmlFor="paddingBottom"
            value={data.padding?.bottom ?? 80}
            min={0}
            max={200}
            step={10}
            unit="px"
            onChange={(v) => handlePaddingChange("bottom", v)}
          />
        </div>
      </div>
    </div>
  );
}
