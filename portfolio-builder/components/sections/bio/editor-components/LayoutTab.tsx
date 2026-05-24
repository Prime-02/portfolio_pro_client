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
// Option definitions — 8 distinct layouts
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
      description: "Full-width, clean vertical flow",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="6" y="4" width="36" height="2.5" rx="1" fill="currentColor" opacity="0.9" />
          <rect x="6" y="8.5" width="36" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="6" y="11.5" width="28" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="6" y="14.5" width="32" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="6" y="17.5" width="20" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
          <rect x="6" y="20.5" width="24" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
          <rect x="6" y="23.5" width="16" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
        </svg>
      ),
    },
    {
      value: "split",
      label: "Split",
      description: "Headline left, content right",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="3" y="4" width="19" height="2.5" rx="1" fill="currentColor" opacity="0.9" />
          <rect x="3" y="8" width="15" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="3" y="11" width="13" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="26" y="4" width="19" height="1.5" rx="0.75" fill="currentColor" opacity="0.6" />
          <rect x="26" y="7" width="17" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="26" y="10" width="15" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="26" y="13" width="17" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="26" y="16" width="13" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
          <rect x="26" y="19" width="15" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
          <rect x="26" y="22" width="11" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
        </svg>
      ),
    },
    {
      value: "magazine",
      label: "Magazine",
      description: "Wide header, two-column body",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="3" y="3" width="42" height="2.5" rx="1" fill="currentColor" opacity="0.9" />
          <rect x="3" y="7" width="42" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
          <rect x="3" y="11" width="20" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="3" y="14" width="18" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="3" y="17" width="16" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
          <rect x="25" y="11" width="20" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="25" y="14" width="18" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="25" y="17" width="16" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
          <rect x="3" y="21" width="22" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
        </svg>
      ),
    },
    {
      value: "featured",
      label: "Featured",
      description: "Hero headline, pull-quote bio, info grid",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="3" y="2" width="42" height="3.5" rx="1" fill="currentColor" opacity="0.9" />
          <rect x="6" y="7" width="36" height="1.2" rx="0.6" fill="currentColor" opacity="0.5" />
          <rect x="6" y="9.5" width="32" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
          <rect x="3" y="14" width="10" height="2" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="3" y="17" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="14.5" y="14" width="10" height="2" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="14.5" y="17" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="26" y="14" width="10" height="2" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="26" y="17" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="37.5" y="14" width="7.5" height="2" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="37.5" y="17" width="7.5" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="3" y="22" width="12" height="1.5" rx="0.75" fill="currentColor" opacity="0.6" />
        </svg>
      ),
    },
    {
      value: "sidebar",
      label: "Sidebar",
      description: "Left sidebar, main content right",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor" opacity="0.8" />
          <rect x="2" y="6" width="10" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
          <rect x="2" y="8.5" width="11" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
          <rect x="2" y="11" width="9" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
          <rect x="2" y="13.5" width="8" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
          <rect x="2" y="16" width="10" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
          <rect x="2" y="18.5" width="7" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
          <rect x="16" y="3" width="30" height="2.5" rx="1" fill="currentColor" opacity="0.9" />
          <rect x="16" y="7" width="28" height="1.2" rx="0.6" fill="currentColor" opacity="0.5" />
          <rect x="16" y="9.5" width="26" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
          <rect x="16" y="12" width="24" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
          <rect x="16" y="15" width="22" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="16" y="18" width="20" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="16" y="21" width="14" height="1.5" rx="0.75" fill="currentColor" opacity="0.6" />
        </svg>
      ),
    },
    {
      value: "minimal",
      label: "Minimal",
      description: "Ultra-clean, generous whitespace",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="10" y="7" width="28" height="2.5" rx="1" fill="currentColor" opacity="0.9" />
          <rect x="10" y="12" width="28" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
          <rect x="10" y="14.5" width="24" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
          <rect x="14" y="20" width="20" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
        </svg>
      ),
    },
    {
      value: "bento",
      label: "Bento",
      description: "Masonry-style card grid layout",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="2" y="2" width="22" height="10" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          <rect x="5" y="4" width="16" height="2" rx="1" fill="currentColor" opacity="0.9" />
          <rect x="5" y="7" width="14" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
          <rect x="26" y="2" width="20" height="6" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          <rect x="29" y="4" width="14" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="29" y="6" width="12" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
          <rect x="2" y="14" width="14" height="8" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          <rect x="5" y="16" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="5" y="19" width="8" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
          <rect x="18" y="14" width="14" height="8" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          <rect x="21" y="16" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="21" y="19" width="8" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
          <rect x="34" y="10" width="12" height="12" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          <rect x="37" y="12" width="8" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="37" y="15" width="6" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
          <rect x="37" y="18" width="8" height="1.2" rx="0.6" fill="currentColor" opacity="0.4" />
        </svg>
      ),
    },
    {
      value: "showcase",
      label: "Showcase",
      description: "Cinematic full-bleed with overlay panels",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="0" y="0" width="48" height="32" rx="0" fill="currentColor" opacity="0.06" />
          <rect x="6" y="6" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
          <rect x="6" y="11" width="30" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="6" y="14" width="26" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
          <rect x="6" y="20" width="16" height="6" rx="1" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          <rect x="8" y="22" width="12" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="8" y="24.5" width="10" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
          <rect x="24" y="20" width="18" height="6" rx="1" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
          <rect x="26" y="22" width="14" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
          <rect x="26" y="24.5" width="12" height="1.2" rx="0.6" fill="currentColor" opacity="0.3" />
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
        <div className="grid grid-cols-4 gap-2">
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
                    ? "border-foreground bg-foreground/5 text-foreground"
                    : "border-foreground/15 bg-background text-foreground/50 hover:bg-foreground/5",
                ].join(" ")}
              >
                <div className="h-10 w-full">{preview}</div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span className={["text-xs font-semibold", active ? "text-foreground" : "text-foreground/70"].join(" ")}>
                    {label}
                  </span>
                  <span className="text-[10px] leading-tight text-foreground/40">{description}</span>
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