"use client";

import { CertificationData, CertificationLayout } from "@/portfolio-builder/types/certification";
import SelectField from "../../bio/editor-components/SelectField";
import SliderField from "../../bio/editor-components/SliderField";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";

interface CertificationLayoutTabProps {
  data: CertificationData;
  onChange: <K extends keyof CertificationData>(key: K, value: CertificationData[K]) => void;
}

const LAYOUT_OPTIONS: {
  value: CertificationLayout;
  label: string;
  description: string;
  preview: React.ReactNode;
}[] = [
  {
    value: "badge-grid",
    label: "Badge Grid",
    description: "Responsive grid of certification badges",
    preview: (
      <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
        <rect x="2" y="2" width="14" height="12" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="18" y="2" width="14" height="12" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="34" y="2" width="12" height="12" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="2" y="17" width="14" height="12" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="18" y="17" width="14" height="12" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="34" y="17" width="12" height="12" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
      </svg>
    ),
  },
  {
    value: "credential-wall",
    label: "Credential Wall",
    description: "Masonry-style wall of credentials",
    preview: (
      <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
        <rect x="2" y="2" width="14" height="14" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <rect x="18" y="2" width="14" height="10" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="34" y="2" width="12" height="16" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <rect x="2" y="19" width="14" height="10" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="18" y="15" width="14" height="14" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <rect x="34" y="21" width="12" height="8" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
      </svg>
    ),
  },
  {
    value: "verification-list",
    label: "Verification List",
    description: "Vertical stack, full-width cards",
    preview: (
      <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
        <rect x="4" y="2" width="40" height="5" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="4" y="9" width="40" height="5" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="4" y="16" width="40" height="5" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="4" y="23" width="40" height="5" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
      </svg>
    ),
  },
  {
    value: "certificate-carousel",
    label: "Certificate Carousel",
    description: "Paginated cards with navigation",
    preview: (
      <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
        <rect x="2" y="4" width="12" height="20" rx="1" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
        <rect x="16" y="2" width="16" height="24" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <rect x="34" y="4" width="12" height="20" rx="1" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
        <circle cx="24" cy="30" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="28" cy="30" r="1" fill="currentColor" opacity="0.2" />
        <circle cx="20" cy="30" r="1" fill="currentColor" opacity="0.2" />
      </svg>
    ),
  },
  {
    value: "cert-timeline",
    label: "Certification Timeline",
    description: "Vertical chronological timeline with nodes",
    preview: (
      <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
        <line x1="24" y1="2" x2="24" y2="30" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="24" cy="6" r="2" fill="currentColor" opacity="0.3" />
        <rect x="4" y="2" width="16" height="8" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="24" cy="16" r="2" fill="currentColor" opacity="0.3" />
        <rect x="28" y="12" width="16" height="8" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="24" cy="26" r="2" fill="currentColor" opacity="0.3" />
        <rect x="4" y="22" width="16" height="8" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
      </svg>
    ),
  },
  {
    value: "cert-masonry",
    label: "Cert Masonry",
    description: "Multi-column masonry layout",
    preview: (
      <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
        <rect x="2" y="2" width="14" height="10" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="18" y="2" width="14" height="14" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <rect x="34" y="2" width="12" height="8" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="2" y="14" width="14" height="14" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <rect x="18" y="19" width="14" height="10" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="34" y="13" width="12" height="16" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
      </svg>
    ),
  },
];

const ALIGNMENT_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const GAP_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "date-desc", label: "Date (Newest first)" },
  { value: "date-asc", label: "Date (Oldest first)" },
  { value: "issuer-asc", label: "Issuer (A → Z)" },
  { value: "issuer-desc", label: "Issuer (Z → A)" },
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
];

// Layouts where a column count does not apply
const SINGLE_COLUMN_LAYOUTS: CertificationLayout[] = ["verification-list", "cert-timeline"];

export default function CertificationLayoutTab({ data, onChange }: CertificationLayoutTabProps) {
  const handlePaddingChange = (side: "top" | "bottom", value: number) => {
    onChange("padding", { ...data.padding, [side]: value });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Section Content ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Section Content</h3>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--pb-text-secondary)]">
            Headline
          </label>
          <input
            type="text"
            value={data.headline || ""}
            onChange={(e) => onChange("headline", e.target.value || undefined)}
            placeholder="Certifications"
            className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm text-[var(--pb-text-primary)] placeholder-[var(--pb-input-placeholder)] focus:outline-none focus:border-[var(--pb-input-border-focus)] focus:ring-1 focus:ring-[var(--pb-input-border-focus)] transition-colors"
          />
          <label className="block text-sm font-medium text-[var(--pb-text-secondary)]">
            Subheadline
          </label>
          <input
            type="text"
            value={data.subheadline || ""}
            onChange={(e) => onChange("subheadline", e.target.value || undefined)}
            placeholder="My professional credentials"
            className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm text-[var(--pb-text-primary)] placeholder-[var(--pb-input-placeholder)] focus:outline-none focus:border-[var(--pb-input-border-focus)] focus:ring-1 focus:ring-[var(--pb-input-border-focus)] transition-colors"
          />
        </div>
      </div>

      {/* ── Layout picker ── */}
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
                    ? "border-foreground bg-foreground/5 text-foreground"
                    : "border-foreground/15 bg-background text-foreground/50 hover:bg-foreground/5",
                ].join(" ")}
              >
                <div className="h-10 w-full">{preview}</div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span
                    className={[
                      "text-xs font-semibold",
                      active ? "text-foreground" : "text-foreground/70",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                  <span className="text-[10px] leading-tight text-foreground/40">{description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Alignment ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Alignment</h3>
        <SelectField
          label="Horizontal Alignment"
          id="alignment"
          value={data.alignment}
          onChange={(value) => onChange("alignment", value as "left" | "center" | "right")}
          options={ALIGNMENT_OPTIONS}
        />
      </div>

      {/* ── Columns — hidden for layouts that do not use a column grid ── */}
      {!SINGLE_COLUMN_LAYOUTS.includes(data.layout) && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>
            {data.layout === "certificate-carousel" ? "Cards per Page" : "Columns"}
          </h3>
          <SliderField
            label={data.layout === "certificate-carousel" ? "Cards per page" : "Number of columns"}
            htmlFor="columns"
            value={data.columns}
            min={1}
            max={4}
            step={1}
            onChange={(v) => onChange("columns", v)}
          />
        </div>
      )}

      {/* ── Gap ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Gap</h3>
        <SelectField
          label="Card spacing"
          id="gap"
          value={data.gap}
          onChange={(value) => onChange("gap", value as "small" | "medium" | "large")}
          options={GAP_OPTIONS}
        />
      </div>

      {/* ── Sorting ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Sort Order</h3>
        <SelectField
          label="Sort certifications by"
          id="sortBy"
          value={data.filters._sortBy || "default"}
          onChange={(value) => {
            onChange("filters", {
              ...data.filters,
              _sortBy: value === "default" ? undefined : (value as CertificationData["filters"]["_sortBy"]),
            });
          }}
          options={SORT_OPTIONS}
        />
      </div>

      {/* ── Max Width ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Content Width</h3>
        <SliderField
          label="Max Width"
          htmlFor="maxWidth"
          value={data.maxWidth}
          min={600}
          max={1400}
          step={50}
          unit="px"
          onChange={(v) => onChange("maxWidth", v)}
        />
      </div>

      {/* ── Padding ── */}
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
