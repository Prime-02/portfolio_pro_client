// portfolio-builder/components/sections/blogs/editor-components/BlogsCardLayoutTab.tsx

"use client";

import { useId, useMemo, useState } from "react";
import { BlogsData, BlogCardStyle, BlogCardOverride } from "@/portfolio-builder/types/blogs";
import SelectField from "../../bio/editor-components/SelectField";
import Toggle from "../../bio/editor-components/Toggle";
import ColorPicker from "../../bio/editor-components/ColorPicker";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import type { ContentType, ContentStatus } from "@/lib/stores/contents/types/content.types";

interface BlogsCardLayoutTabProps {
  data: BlogsData;
  onChange: <K extends keyof BlogsData>(key: K, value: BlogsData[K]) => void;
}

const CARD_STYLE_OPTIONS = [
  { value: "compact", label: "Compact — Minimal, title + metadata strip" },
  { value: "standard", label: "Standard — Cover, title, excerpt, metadata" },
  { value: "detailed", label: "Detailed — Full info with reactions, tags, dates" },
  { value: "minimal", label: "Minimal — Text-only list item style" },
  { value: "featured", label: "Featured — Large hero card with full bleed image" },
  { value: "magazine", label: "Magazine — Editorial layout with rich typography" },
];

const CARD_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const DATE_DISPLAY_OPTIONS = [
  { value: "relative", label: "Relative (e.g., '2 days ago')" },
  { value: "absolute", label: "Absolute (e.g., 'Jan 15, 2024')" },
  { value: "hidden", label: "Hidden" },
];

const STATUS_DISPLAY_OPTIONS = [
  { value: "badge", label: "Badge" },
  { value: "text", label: "Text only" },
  { value: "hidden", label: "Hidden" },
];

const REACTION_DISPLAY_OPTIONS = [
  { value: "icons", label: "Icons with counts" },
  { value: "count", label: "Count only" },
  { value: "badge", label: "Badge" },
  { value: "hidden", label: "Hidden" },
];

const OVERRIDE_TARGET_OPTIONS = [
  { id: "ids", code: "Specific Content IDs" },
  { id: "categories", code: "Categories" },
  { id: "tags", code: "Tags" },
  { id: "statuses", code: "Statuses" },
  { id: "content_types", code: "Content Types" },
  { id: "is_featured", code: "Featured Status" },
  { id: "is_pinned", code: "Pinned Status" },
];

export default function BlogsCardLayoutTab({ data, onChange }: BlogsCardLayoutTabProps) {
  const [expandedOverride, setExpandedOverride] = useState<number | null>(null);
  const { publicItems } = useContentStore();

  const blogsOptions = useMemo(
    () => publicItems.map((blog) => ({ id: blog.id || useId(), code: blog.title })),
    [publicItems]
  );

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    return publicItems
      .map((b) => b.category)
      .filter((c): c is string => !!c && !seen.has(c) && !!seen.add(c))
      .map((c) => ({ id: c, code: c }));
  }, [publicItems]);

  const tagOptions = useMemo(() => {
    const seen = new Set<string>();
    return publicItems
      .flatMap((b) => b.tags || [])
      .filter((t): t is string => !!t && !seen.has(t) && !!seen.add(t))
      .map((t) => ({ id: t, code: t }));
  }, [publicItems]);

  const statusOptions = useMemo(() => {
    const seen = new Set<ContentStatus>();
    return publicItems
      .map((b) => b.status)
      .filter((s): s is ContentStatus => !!s && !seen.has(s) && !!seen.add(s))
      .map((s) => ({ id: s, code: s }));
  }, [publicItems]);

  const contentTypeOptions = useMemo(() => {
    const seen = new Set<ContentType>();
    return publicItems
      .map((b) => b.content_type)
      .filter((t): t is ContentType => !!t && !seen.has(t) && !!seen.add(t))
      .map((t) => ({ id: t, code: t }));
  }, [publicItems]);

  const updateOverride = (index: number, updates: Partial<BlogCardOverride>) => {
    const updated = [...data.cardOverrides];
    updated[index] = { ...updated[index], ...updates };
    onChange("cardOverrides", updated);
  };

  const removeOverride = (index: number) => {
    onChange("cardOverrides", data.cardOverrides.filter((_, i) => i !== index));
  };

  const addOverride = () => {
    const newOverride: BlogCardOverride = {
      target: {},
      style: "detailed",
    };
    onChange("cardOverrides", [...data.cardOverrides, newOverride]);
    setExpandedOverride(data.cardOverrides.length);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Default Card Style */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Default Card Style</h3>
        <SelectField
          label="Card Style"
          id="cardStyle"
          value={data.cardStyle}
          onChange={(v) => onChange("cardStyle", v as BlogCardStyle)}
          options={CARD_STYLE_OPTIONS}
        />
        <SelectField
          label="Card Size"
          id="cardSize"
          value={data.cardSize}
          onChange={(v) => onChange("cardSize", v as "small" | "medium" | "large")}
          options={CARD_SIZE_OPTIONS}
        />
      </div>

      {/* Display Options */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Display Options</h3>
        <div className="space-y-3">
          <Toggle label="Show cover image" checked={data.showImage} onChange={(v) => onChange("showImage", v)} />
          <Toggle label="Show title" checked={data.showTitle} onChange={(v) => onChange("showTitle", v)} />
          <Toggle label="Show excerpt" checked={data.showExcerpt} onChange={(v) => onChange("showExcerpt", v)} />
          <Toggle label="Show body/content" checked={data.showBody} onChange={(v) => onChange("showBody", v)} />
          <Toggle label="Show author" checked={data.showAuthor} onChange={(v) => onChange("showAuthor", v)} />
          <Toggle label="Show dates" checked={data.showDates} onChange={(v) => onChange("showDates", v)} />
          <Toggle label="Show status" checked={data.showStatus} onChange={(v) => onChange("showStatus", v)} />
          <Toggle label="Show tags" checked={data.showTags} onChange={(v) => onChange("showTags", v)} />
          <Toggle label="Show category" checked={data.showCategory} onChange={(v) => onChange("showCategory", v)} />
          <Toggle label="Show reactions/likes" checked={data.showReactions} onChange={(v) => onChange("showReactions", v)} />
          <Toggle label="Show comment count" checked={data.showComments} onChange={(v) => onChange("showComments", v)} />
          <Toggle label="Show view count" checked={data.showViews} onChange={(v) => onChange("showViews", v)} />
          <Toggle label="Show read time" checked={data.showReadTime} onChange={(v) => onChange("showReadTime", v)} />
          <Toggle label="Show share button" checked={data.showShare} onChange={(v) => onChange("showShare", v)} />
          <Toggle label="Show bookmark button" checked={data.showBookmark} onChange={(v) => onChange("showBookmark", v)} />
          <Toggle label="Show content URL" checked={data.showUrl} onChange={(v) => onChange("showUrl", v)} />
        </div>
      </div>

      {/* Date Display */}
      {data.showDates && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Date Display</h3>
          <SelectField
            label="Display Style"
            id="dateDisplay"
            value={data.dateDisplay}
            onChange={(v) => onChange("dateDisplay", v as BlogsData["dateDisplay"])}
            options={DATE_DISPLAY_OPTIONS}
          />
        </div>
      )}

      {/* Status Display */}
      {data.showStatus && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Status Display</h3>
          <SelectField
            label="Display Style"
            id="statusDisplay"
            value={data.statusDisplay}
            onChange={(v) => onChange("statusDisplay", v as BlogsData["statusDisplay"])}
            options={STATUS_DISPLAY_OPTIONS}
          />
        </div>
      )}

      {/* Reaction Display */}
      {data.showReactions && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Reaction Display</h3>
          <SelectField
            label="Display Style"
            id="reactionDisplay"
            value={data.reactionDisplay}
            onChange={(v) => onChange("reactionDisplay", v as BlogsData["reactionDisplay"])}
            options={REACTION_DISPLAY_OPTIONS}
          />
        </div>
      )}

      {/* Card Overrides */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleClass}>Style Overrides</h3>
          <button type="button" onClick={addOverride} className="text-xs px-2 py-1 rounded-md border border-[var(--pb-border)] hover:bg-[var(--pb-surface-hover)] transition-colors text-[var(--pb-text-primary)]">+ Add Override</button>
        </div>
        <p className="text-xs text-[var(--pb-text-muted)] mb-3">
          Style specific content differently based on category, tags, status, or hand-picked IDs.
        </p>
        {data.cardOverrides.length === 0 && <p className="text-xs text-[var(--pb-text-muted)]">No overrides configured.</p>}
        {data.cardOverrides.map((override, index) => {
          const isExpanded = expandedOverride === index;
          const targetDesc = Object.entries(override.target).filter(([, v]) => v !== undefined).map(([k, v]) => {
            if (Array.isArray(v)) return `${k}: ${v.length} selected`;
            return `${k}: ${v}`;
          }).join(", ") || "No target set";

          return (
            <div key={index} className="border border-[var(--pb-border)] rounded-lg overflow-hidden bg-[var(--pb-surface)]">
              <button type="button" onClick={() => setExpandedOverride(isExpanded ? null : index)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left">
                <span className="text-xs text-[var(--pb-text-muted)]">Override {index + 1}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)] border border-[var(--pb-border)] capitalize">{override.style}</span>
                <span className="text-[10px] text-[var(--pb-text-muted)] truncate flex-1">{targetDesc}</span>
                <span className="text-[var(--pb-text-muted)] text-xs">{isExpanded ? "▲" : "▼"}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); removeOverride(index); }} className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] px-1">✕</button>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-[var(--pb-border)] pt-3">
                  {/* Target type toggle pills */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Target By</label>
                    <div className="flex flex-wrap gap-2">
                      {OVERRIDE_TARGET_OPTIONS.map((opt) => {
                        const isActive = opt.id === "ids" ? "ids" in override.target
                          : opt.id === "categories" ? "categories" in override.target
                          : opt.id === "tags" ? "tags" in override.target
                          : opt.id === "statuses" ? "statuses" in override.target
                          : opt.id === "content_types" ? "content_types" in override.target
                          : opt.id === "is_featured" ? "is_featured" in override.target
                          : opt.id === "is_pinned" ? "is_pinned" in override.target
                          : false;

                        return (
                          <button key={opt.id} type="button" onClick={() => {
                            const next = { ...override.target } as Record<string, unknown>;
                            if (opt.id === "ids") { if ("ids" in next) delete next.ids; else next.ids = []; }
                            else if (opt.id === "categories") { if ("categories" in next) delete next.categories; else next.categories = []; }
                            else if (opt.id === "tags") { if ("tags" in next) delete next.tags; else next.tags = []; }
                            else if (opt.id === "statuses") { if ("statuses" in next) delete next.statuses; else next.statuses = []; }
                            else if (opt.id === "content_types") { if ("content_types" in next) delete next.content_types; else next.content_types = []; }
                            else if (opt.id === "is_featured") { if ("is_featured" in next) delete next.is_featured; else next.is_featured = true; }
                            else if (opt.id === "is_pinned") { if ("is_pinned" in next) delete next.is_pinned; else next.is_pinned = true; }
                            updateOverride(index, { target: next as BlogCardOverride["target"] });
                          }} className={`text-xs px-2 py-1 rounded-md border transition-colors ${isActive ? "border-[var(--pb-foreground)] bg-[var(--pb-foreground-10)] text-[var(--pb-text-primary)]" : "border-[var(--pb-border)] text-[var(--pb-text-muted)] hover:border-[var(--pb-foreground-20)]"}`}>{opt.code}</button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content IDs */}
                  {override.target.ids !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Content IDs</label>
                      <Dropdown id={`override-ids-${index}`} options={blogsOptions} multiple selectAll type="datalist" placeholder="Search content…" tag="content" valueKey="id" displayKey="code" includeNoneOption={false} value={override.target.ids ?? []} onSelect={(val) => { const ids = Array.isArray(val) ? val : val ? [val] : []; updateOverride(index, { target: { ...override.target, ids } }); }} />
                    </div>
                  )}

                  {/* Categories */}
                  {override.target.categories !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Categories</label>
                      <Dropdown id={`override-categories-${index}`} options={categoryOptions} multiple selectAll type="datalist" placeholder="Search categories…" tag="category" valueKey="id" displayKey="code" includeNoneOption={false} value={override.target.categories ?? []} onSelect={(val) => { const categories = Array.isArray(val) ? val : val ? [val] : []; updateOverride(index, { target: { ...override.target, categories } }); }} />
                    </div>
                  )}

                  {/* Tags */}
                  {override.target.tags !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Tags</label>
                      <Dropdown id={`override-tags-${index}`} options={tagOptions} multiple selectAll type="datalist" placeholder="Search tags…" tag="tag" valueKey="id" displayKey="code" includeNoneOption={false} value={override.target.tags ?? []} onSelect={(val) => { const tags = Array.isArray(val) ? val : val ? [val] : []; updateOverride(index, { target: { ...override.target, tags } }); }} />
                    </div>
                  )}

                  {/* Statuses */}
                  {override.target.statuses !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Statuses</label>
                      <Dropdown id={`override-statuses-${index}`} options={statusOptions} multiple selectAll type="datalist" placeholder="Search statuses…" tag="status" valueKey="id" displayKey="code" includeNoneOption={false} value={override.target.statuses ?? []} onSelect={(val) => { const statuses = Array.isArray(val) ? val : val ? [val] : []; updateOverride(index, { target: { ...override.target, statuses } }); }} />
                    </div>
                  )}

                  {/* Content Types */}
                  {override.target.content_types !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Content Types</label>
                      <Dropdown id={`override-content-types-${index}`} options={contentTypeOptions} multiple selectAll type="datalist" placeholder="Search types…" tag="type" valueKey="id" displayKey="code" includeNoneOption={false} value={override.target.content_types ?? []} onSelect={(val) => { const content_types = Array.isArray(val) ? val : val ? [val] : []; updateOverride(index, { target: { ...override.target, content_types } }); }} />
                    </div>
                  )}

                  {/* is_featured toggle */}
                  {override.target.is_featured !== undefined && (
                    <Toggle label="Target featured content" checked={override.target.is_featured} onChange={(v) => updateOverride(index, { target: { ...override.target, is_featured: v } })} />
                  )}

                  {/* is_pinned toggle */}
                  {override.target.is_pinned !== undefined && (
                    <Toggle label="Target pinned content" checked={override.target.is_pinned} onChange={(v) => updateOverride(index, { target: { ...override.target, is_pinned: v } })} />
                  )}

                  {/* Override style */}
                  <SelectField label="Override Style" id={`override-style-${index}`} value={override.style} onChange={(v) => updateOverride(index, { style: v as BlogCardStyle })} options={CARD_STYLE_OPTIONS} />

                  {/* Override display toggles */}
                  <div className="space-y-2">
                    <Toggle label="Show image (override)" checked={override.showImage ?? data.showImage} onChange={(v) => updateOverride(index, { showImage: v })} />
                    <Toggle label="Show title (override)" checked={override.showTitle ?? data.showTitle} onChange={(v) => updateOverride(index, { showTitle: v })} />
                    <Toggle label="Show excerpt (override)" checked={override.showExcerpt ?? data.showExcerpt} onChange={(v) => updateOverride(index, { showExcerpt: v })} />
                    <Toggle label="Show body (override)" checked={override.showBody ?? data.showBody} onChange={(v) => updateOverride(index, { showBody: v })} />
                    <Toggle label="Show author (override)" checked={override.showAuthor ?? data.showAuthor} onChange={(v) => updateOverride(index, { showAuthor: v })} />
                    <Toggle label="Show dates (override)" checked={override.showDates ?? data.showDates} onChange={(v) => updateOverride(index, { showDates: v })} />
                    <Toggle label="Show status (override)" checked={override.showStatus ?? data.showStatus} onChange={(v) => updateOverride(index, { showStatus: v })} />
                    <Toggle label="Show tags (override)" checked={override.showTags ?? data.showTags} onChange={(v) => updateOverride(index, { showTags: v })} />
                    <Toggle label="Show category (override)" checked={override.showCategory ?? data.showCategory} onChange={(v) => updateOverride(index, { showCategory: v })} />
                    <Toggle label="Show reactions (override)" checked={override.showReactions ?? data.showReactions} onChange={(v) => updateOverride(index, { showReactions: v })} />
                    <Toggle label="Show comments (override)" checked={override.showComments ?? data.showComments} onChange={(v) => updateOverride(index, { showComments: v })} />
                    <Toggle label="Show views (override)" checked={override.showViews ?? data.showViews} onChange={(v) => updateOverride(index, { showViews: v })} />
                    <Toggle label="Show read time (override)" checked={override.showReadTime ?? data.showReadTime} onChange={(v) => updateOverride(index, { showReadTime: v })} />
                    <Toggle label="Show share (override)" checked={override.showShare ?? data.showShare} onChange={(v) => updateOverride(index, { showShare: v })} />
                    <Toggle label="Show bookmark (override)" checked={override.showBookmark ?? data.showBookmark} onChange={(v) => updateOverride(index, { showBookmark: v })} />
                    <Toggle label="Show URL (override)" checked={override.showUrl ?? data.showUrl} onChange={(v) => updateOverride(index, { showUrl: v })} />
                  </div>

                  {/* Accent color */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Accent Color</label>
                    <ColorPicker id={`override-color-${index}`} value={override.accentColor || ""} onChange={(v) => updateOverride(index, { accentColor: v || undefined })} placeholder="Default" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
