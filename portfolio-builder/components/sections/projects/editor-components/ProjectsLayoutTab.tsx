// portfolio-builder/components/sections/projects/editor-components/ProjectsLayoutTab.tsx

import { ProjectsData, ProjectsLayout } from "@/portfolio-builder/types/projects";
import SelectField from "../../bio/editor-components/SelectField";
import SliderField from "../../bio/editor-components/SliderField";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";

interface ProjectsLayoutTabProps {
  data: ProjectsData;
  onChange: <K extends keyof ProjectsData>(key: K, value: ProjectsData[K]) => void;
}

const LAYOUT_OPTIONS: {
  value: ProjectsLayout;
  label: string;
  description: string;
  preview: React.ReactNode;
}[] = [
    {
      value: "grid",
      label: "Grid",
      description: "Responsive columns, equal height cards",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <rect x="2" y="2" width="14" height="12" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="18" y="2" width="14" height="12" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="34" y="2" width="12" height="12" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="2" y="17" width="14" height="12" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="18" y="17" width="14" height="12" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="34" y="17" width="12" height="12" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>
      ),
    },
    {
      value: "masonry",
      label: "Masonry",
      description: "Pinterest-style staggered columns",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <rect x="2" y="2" width="14" height="10" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="2" y="14" width="14" height="14" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="18" y="2" width="14" height="16" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="18" y="20" width="14" height="8" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="34" y="2" width="12" height="12" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="34" y="16" width="12" height="12" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>
      ),
    },
    {
      value: "horizontal-scroll",
      label: "Horizontal Scroll",
      description: "Single row, scrollable cards",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <rect x="2" y="6" width="14" height="20" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="18" y="6" width="14" height="20" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="34" y="6" width="14" height="20" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <path d="M44 14l4-2v8l-4-2z" fill="var(--pb-foreground)" opacity="0.3" />
        </svg>
      ),
    },
    {
      value: "list",
      label: "List",
      description: "Vertical stack, full-width cards",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <rect x="4" y="2" width="40" height="5" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="4" y="9" width="40" height="5" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="4" y="16" width="40" height="5" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="4" y="23" width="40" height="5" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>
      ),
    },
    {
      value: "carousel",
      label: "Carousel",
      description: "Paginated cards with navigation",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <rect x="2" y="4" width="12" height="20" rx="1" fill="var(--pb-foreground)" opacity="0.1" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.2" />
          <rect x="16" y="2" width="16" height="24" rx="1" fill="var(--pb-foreground)" opacity="0.2" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.4" />
          <rect x="34" y="4" width="12" height="20" rx="1" fill="var(--pb-foreground)" opacity="0.1" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.2" />
          <circle cx="24" cy="30" r="1" fill="var(--pb-foreground)" opacity="0.5" />
          <circle cx="28" cy="30" r="1" fill="var(--pb-foreground)" opacity="0.2" />
          <circle cx="20" cy="30" r="1" fill="var(--pb-foreground)" opacity="0.2" />
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
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "date-asc", label: "Date (Oldest → Newest)" },
  { value: "date-desc", label: "Date (Newest → Oldest)" },
  { value: "status-asc", label: "Status (A → Z)" },
  { value: "status-desc", label: "Status (Z → A)" },
];

// Layouts where a column count doesn't apply
const SINGLE_COLUMN_LAYOUTS: ProjectsLayout[] = ["list", "horizontal-scroll"];

export default function ProjectsLayoutTab({ data, onChange }: ProjectsLayoutTabProps) {
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
            placeholder="Featured Projects"
            className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm text-[var(--pb-text-primary)] placeholder-[var(--pb-input-placeholder)] focus:outline-none focus:border-[var(--pb-input-border-focus)] focus:ring-1 focus:ring-[var(--pb-input-border-focus)] transition-colors"
          />
          <label className="block text-sm font-medium text-[var(--pb-text-secondary)]">
            Subheadline
          </label>
          <input
            type="text"
            value={data.subheadline || ""}
            onChange={(e) => onChange("subheadline", e.target.value || undefined)}
            placeholder="A selection of my recent work"
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
                className="flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-input-border-focus)] hover:border-[var(--pb-border-hover)]"
                style={{
                  borderColor: active
                    ? 'var(--pb-text-primary)'
                    : 'var(--pb-border)',
                  backgroundColor: active
                    ? 'var(--pb-surface-elevated)'
                    : 'var(--pb-background)',
                  color: active
                    ? 'var(--pb-text-primary)'
                    : 'var(--pb-text-muted)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--pb-surface)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--pb-background)';
                  }
                }}
              >
                <div className="h-10 w-full">{preview}</div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: active
                        ? 'var(--pb-text-primary)'
                        : 'var(--pb-text-secondary)',
                    }}
                  >
                    {label}
                  </span>
                  <span className="text-[10px] leading-tight text-[var(--pb-text-muted)]">{description}</span>
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

      {/* ── Columns — hidden for layouts that don't use a column grid ── */}
      {!SINGLE_COLUMN_LAYOUTS.includes(data.layout) && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>
            {data.layout === "carousel" ? "Cards per Page" : "Columns"}
          </h3>
          <SliderField
            label={data.layout === "carousel" ? "Cards per page" : "Number of columns"}
            value={data.columns}
            min={1}
            max={6}
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
          label="Sort projects by"
          id="sortBy"
          value={data.filters._sortBy || "default"}
          onChange={(value) => {
            onChange("filters", {
              ...data.filters,
              _sortBy: value === "default" ? undefined : (value as ProjectsData["filters"]["_sortBy"]),
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
          value={data.maxWidth}
          min={600}
          max={1400}
          step={50}
          onChange={(v) => onChange("maxWidth", v)}
        />
      </div>

      {/* ── Padding ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Section Padding</h3>
        <div className="grid grid-cols-1 gap-3">
          <SliderField
            label="Top"
            value={data.padding?.top ?? 80}
            min={0}
            max={200}
            step={10}
            onChange={(v) => handlePaddingChange("top", v)}
          />
          <SliderField
            label="Bottom"
            value={data.padding?.bottom ?? 80}
            min={0}
            max={200}
            step={10}
            onChange={(v) => handlePaddingChange("bottom", v)}
          />
        </div>
      </div>
    </div>
  );
}