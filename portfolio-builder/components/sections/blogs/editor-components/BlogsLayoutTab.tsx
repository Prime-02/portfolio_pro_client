// portfolio-builder/components/sections/blogs/editor-components/BlogsLayoutTab.tsx

import { BlogsData, BlogsLayout } from "@/portfolio-builder/types/blogs";
import SelectField from "../../bio/editor-components/SelectField";
import SliderField from "../../bio/editor-components/SliderField";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";

interface BlogsLayoutTabProps {
  data: BlogsData;
  onChange: <K extends keyof BlogsData>(key: K, value: BlogsData[K]) => void;
}

const LAYOUT_OPTIONS: {
  value: BlogsLayout;
  label: string;
  description: string;
  preview: React.ReactNode;
}[] = [
    {
      value: "timeline",
      label: "Timeline",
      description: "Chronological vertical feed with date markers",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <circle cx="8" cy="6" r="2" fill="var(--pb-foreground)" opacity="0.4" />
          <rect x="14" y="3" width="30" height="6" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="8" y1="8" x2="8" y2="14" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 1" />
          <circle cx="8" cy="16" r="2" fill="var(--pb-foreground)" opacity="0.4" />
          <rect x="14" y="13" width="30" height="6" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="8" y1="18" x2="8" y2="24" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 1" />
          <circle cx="8" cy="26" r="2" fill="var(--pb-foreground)" opacity="0.4" />
          <rect x="14" y="23" width="30" height="6" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>
      ),
    },
    {
      value: "magazine-grid",
      label: "Magazine Grid",
      description: "Editorial grid with featured lead and supporting cards",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <rect x="2" y="2" width="28" height="18" rx="1" fill="var(--pb-foreground)" opacity="0.2" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.4" />
          <rect x="32" y="2" width="14" height="8" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="32" y="12" width="14" height="8" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="2" y="22" width="14" height="8" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="18" y="22" width="14" height="8" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="34" y="22" width="12" height="8" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>
      ),
    },
    {
      value: "newspaper",
      label: "Newspaper",
      description: "Multi-column editorial with headlines and columns",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <rect x="2" y="2" width="44" height="4" rx="0.5" fill="var(--pb-foreground)" opacity="0.25" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.4" />
          <rect x="2" y="8" width="20" height="10" rx="0.5" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="24" y="8" width="22" height="10" rx="0.5" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="2" y="20" width="14" height="10" rx="0.5" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="18" y="20" width="14" height="10" rx="0.5" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="34" y="20" width="12" height="10" rx="0.5" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>
      ),
    },
    {
      value: "reading-list",
      label: "Reading List",
      description: "Clean vertical stack with numbered entries",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <text x="2" y="7" fontSize="5" fill="var(--pb-foreground)" opacity="0.4" fontWeight="bold">1</text>
          <rect x="8" y="2" width="38" height="5" rx="0.5" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <text x="2" y="15" fontSize="5" fill="var(--pb-foreground)" opacity="0.4" fontWeight="bold">2</text>
          <rect x="8" y="10" width="38" height="5" rx="0.5" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <text x="2" y="23" fontSize="5" fill="var(--pb-foreground)" opacity="0.4" fontWeight="bold">3</text>
          <rect x="8" y="18" width="38" height="5" rx="0.5" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <text x="2" y="31" fontSize="5" fill="var(--pb-foreground)" opacity="0.4" fontWeight="bold">4</text>
          <rect x="8" y="26" width="38" height="5" rx="0.5" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>
      ),
    },
    {
      value: "featured-carousel",
      label: "Featured Carousel",
      description: "Prominent featured card with paginated supporting items",
      preview: (
        <svg viewBox="0 0 48 32" fill="none" className="w-full h-full">
          <rect x="2" y="2" width="44" height="16" rx="1" fill="var(--pb-foreground)" opacity="0.2" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.4" />
          <rect x="2" y="21" width="12" height="8" rx="1" fill="var(--pb-foreground)" opacity="0.1" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.2" />
          <rect x="16" y="21" width="16" height="8" rx="1" fill="var(--pb-foreground)" opacity="0.15" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.3" />
          <rect x="34" y="21" width="12" height="8" rx="1" fill="var(--pb-foreground)" opacity="0.1" stroke="var(--pb-foreground)" strokeWidth="0.5" strokeOpacity="0.2" />
          <circle cx="24" cy="31" r="1" fill="var(--pb-foreground)" opacity="0.5" />
          <circle cx="28" cy="31" r="1" fill="var(--pb-foreground)" opacity="0.2" />
          <circle cx="20" cy="31" r="1" fill="var(--pb-foreground)" opacity="0.2" />
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
  { value: "title-asc", label: "Title (A → Z)" },
  { value: "title-desc", label: "Title (Z → A)" },
  { value: "date-asc", label: "Date (Oldest → Newest)" },
  { value: "date-desc", label: "Date (Newest → Oldest)" },
  { value: "views-desc", label: "Most Viewed" },
  { value: "likes-desc", label: "Most Liked" },
  { value: "comments-desc", label: "Most Commented" },
];

const SINGLE_COLUMN_LAYOUTS: BlogsLayout[] = ["timeline", "reading-list"];

export default function BlogsLayoutTab({ data, onChange }: BlogsLayoutTabProps) {
  const handlePaddingChange = (side: "top" | "bottom", value: number) => {
    onChange("padding", { ...data.padding, [side]: value });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Section Content */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Section Content</h3>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--pb-text-secondary)]">Headline</label>
          <input type="text" value={data.headline || ""} onChange={(e) => onChange("headline", e.target.value || undefined)} placeholder="Latest Writings" className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm text-[var(--pb-text-primary)] placeholder-[var(--pb-input-placeholder)] focus:outline-none focus:border-[var(--pb-input-border-focus)] focus:ring-1 focus:ring-[var(--pb-input-border-focus)] transition-colors" />
          <label className="block text-sm font-medium text-[var(--pb-text-secondary)]">Subheadline</label>
          <input type="text" value={data.subheadline || ""} onChange={(e) => onChange("subheadline", e.target.value || undefined)} placeholder="Thoughts, stories, and ideas" className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm text-[var(--pb-text-primary)] placeholder-[var(--pb-input-placeholder)] focus:outline-none focus:border-[var(--pb-input-border-focus)] focus:ring-1 focus:ring-[var(--pb-input-border-focus)] transition-colors" />
        </div>
      </div>

      {/* Layout picker */}
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

      {/* Alignment */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Alignment</h3>
        <SelectField label="Horizontal Alignment" id="alignment" value={data.alignment} onChange={(value) => onChange("alignment", value as "left" | "center" | "right")} options={ALIGNMENT_OPTIONS} />
      </div>

      {/* Columns */}
      {!SINGLE_COLUMN_LAYOUTS.includes(data.layout) && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>{data.layout === "featured-carousel" ? "Cards per Page" : "Columns"}</h3>
          <SliderField label={data.layout === "featured-carousel" ? "Cards per page" : "Number of columns"} value={data.columns} min={1} max={4} step={1} onChange={(v) => onChange("columns", v)} />
        </div>
      )}

      {/* Gap */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Gap</h3>
        <SelectField label="Card spacing" id="gap" value={data.gap} onChange={(value) => onChange("gap", value as "small" | "medium" | "large")} options={GAP_OPTIONS} />
      </div>

      {/* Sorting */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Sort Order</h3>
        <SelectField label="Sort content by" id="sortBy" value={data.filters._sortBy || "default"} onChange={(value) => { onChange("filters", { ...data.filters, _sortBy: value === "default" ? undefined : (value as BlogsData["filters"]["_sortBy"]) }); }} options={SORT_OPTIONS} />
      </div>

      {/* Max Width */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Content Width</h3>
        <SliderField label="Max Width" value={data.maxWidth} min={600} max={1400} step={50} onChange={(v) => onChange("maxWidth", v)} />
      </div>

      {/* Padding */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Section Padding</h3>
        <div className="grid grid-cols-1 gap-3">
          <SliderField label="Top" value={data.padding?.top ?? 80} min={0} max={200} step={10} onChange={(v) => handlePaddingChange("top", v)} />
          <SliderField label="Bottom" value={data.padding?.bottom ?? 80} min={0} max={200} step={10} onChange={(v) => handlePaddingChange("bottom", v)} />
        </div>
      </div>
    </div>
  );
}