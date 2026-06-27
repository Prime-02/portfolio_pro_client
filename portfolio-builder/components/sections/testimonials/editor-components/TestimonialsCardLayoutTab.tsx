// portfolio-builder/components/sections/testimonials/editor-components/TestimonialsCardLayoutTab.tsx
"use client";

import { useId, useMemo, useState } from "react";
import { TestimonialsData, TestimonialCardStyle, TestimonialCardOverride } from "@/portfolio-builder/types/testimonials";
import SelectField from "../../bio/editor-components/SelectField";
import Toggle from "../../bio/editor-components/Toggle";
import ColorPicker from "../../bio/editor-components/ColorPicker";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";

interface TestimonialsCardLayoutTabProps {
  data: TestimonialsData;
  onChange: <K extends keyof TestimonialsData>(key: K, value: TestimonialsData[K]) => void;
}

const CARD_STYLE_OPTIONS = [
  { value: "compact", label: "Compact — Avatar, name, rating only" },
  { value: "standard", label: "Standard — Full info with quote" },
  { value: "detailed", label: "Detailed — All fields with relationship" },
  { value: "minimal", label: "Minimal — Quote-focused, no avatar" },
  { value: "featured", label: "Featured — Large quote card with emphasis" },
];

const CARD_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const AVATAR_DISPLAY_OPTIONS = [
  { value: "circle", label: "Circle" },
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "hidden", label: "Hidden" },
];

const RATING_DISPLAY_OPTIONS = [
  { value: "stars", label: "Star icons" },
  { value: "number", label: "Numeric score" },
  { value: "badge", label: "Badge" },
  { value: "hidden", label: "Hidden" },
];

const DATE_DISPLAY_OPTIONS = [
  { value: "relative", label: "Relative (e.g., '2 months ago')" },
  { value: "absolute", label: "Absolute (e.g., 'Jan 2024')" },
  { value: "hidden", label: "Hidden" },
];

const OVERRIDE_TARGET_OPTIONS = [
  { id: "ids", code: "Specific Testimonial IDs" },
  { id: "companies", code: "Companies" },
  { id: "relationships", code: "Relationships" },
  { id: "ratings", code: "Ratings" },
  { id: "is_featured", code: "Featured Status" },
];

export default function TestimonialsCardLayoutTab({ data, onChange }: TestimonialsCardLayoutTabProps) {
  const [expandedOverride, setExpandedOverride] = useState<number | null>(null);
  const { userTestimonials } = useTestimonialsStore();

  const testimonialsOptions = useMemo(
    () => userTestimonials.map((t) => ({ id: t.id || useId(), code: `${t.author_name} — ${t.author_company || "No company"}` })),
    [userTestimonials]
  );

  const companyOptions = useMemo(() => {
    const seen = new Set<string>();
    return userTestimonials
      .map((t) => t.author_company)
      .filter((c): c is string => !!c && !seen.has(c) && !!seen.add(c))
      .map((c) => ({ id: c, code: c }));
  }, [userTestimonials]);

  const relationshipOptions = useMemo(() => {
    const seen = new Set<string>();
    return userTestimonials
      .map((t) => t.author_relationship)
      .filter((r): r is string => !!r && !seen.has(r) && !!seen.add(r))
      .map((r) => ({ id: r, code: r }));
  }, [userTestimonials]);

  const ratingOptions = [
    { id: "5", code: "5 Stars" },
    { id: "4", code: "4 Stars" },
    { id: "3", code: "3 Stars" },
    { id: "2", code: "2 Stars" },
    { id: "1", code: "1 Star" },
  ];

  const updateOverride = (index: number, updates: Partial<TestimonialCardOverride>) => {
    const updated = [...data.cardOverrides];
    updated[index] = { ...updated[index], ...updates };
    onChange("cardOverrides", updated);
  };

  const removeOverride = (index: number) => {
    onChange("cardOverrides", data.cardOverrides.filter((_, i) => i !== index));
  };

  const addOverride = () => {
    const newOverride: TestimonialCardOverride = {
      target: {},
      style: "featured",
    };
    onChange("cardOverrides", [...data.cardOverrides, newOverride]);
    setExpandedOverride(data.cardOverrides.length);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Default Card Style</h3>
        <SelectField label="Card Style" id="cardStyle" value={data.cardStyle}
          onChange={(v) => onChange("cardStyle", v as TestimonialCardStyle)} options={CARD_STYLE_OPTIONS} />
        <SelectField label="Card Size" id="cardSize" value={data.cardSize}
          onChange={(v) => onChange("cardSize", v as "small" | "medium" | "large")} options={CARD_SIZE_OPTIONS} />
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Display Options</h3>
        <div className="space-y-3">
          <Toggle label="Show author avatar" checked={data.showAvatar} onChange={(v) => onChange("showAvatar", v)} />
          <Toggle label="Show author name" checked={data.showAuthorName} onChange={(v) => onChange("showAuthorName", v)} />
          <Toggle label="Show author title" checked={data.showAuthorTitle} onChange={(v) => onChange("showAuthorTitle", v)} />
          <Toggle label="Show author company" checked={data.showAuthorCompany} onChange={(v) => onChange("showAuthorCompany", v)} />
          <Toggle label="Show author relationship" checked={data.showAuthorRelationship} onChange={(v) => onChange("showAuthorRelationship", v)} />
          <Toggle label="Show testimonial content" checked={data.showContent} onChange={(v) => onChange("showContent", v)} />
          <Toggle label="Show rating" checked={data.showRating} onChange={(v) => onChange("showRating", v)} />
          <Toggle label="Show date" checked={data.showDate} onChange={(v) => onChange("showDate", v)} />
          <Toggle label="Show featured badge" checked={data.showFeaturedBadge} onChange={(v) => onChange("showFeaturedBadge", v)} />
        </div>
      </div>

      {data.showAvatar && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Avatar Display</h3>
          <SelectField label="Avatar Shape" id="avatarDisplay" value={data.avatarDisplay}
            onChange={(v) => onChange("avatarDisplay", v as TestimonialsData["avatarDisplay"])} options={AVATAR_DISPLAY_OPTIONS} />
        </div>
      )}

      {data.showRating && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Rating Display</h3>
          <SelectField label="Display Style" id="ratingDisplay" value={data.ratingDisplay}
            onChange={(v) => onChange("ratingDisplay", v as TestimonialsData["ratingDisplay"])} options={RATING_DISPLAY_OPTIONS} />
        </div>
      )}

      {data.showDate && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Date Display</h3>
          <SelectField label="Display Style" id="dateDisplay" value={data.dateDisplay}
            onChange={(v) => onChange("dateDisplay", v as TestimonialsData["dateDisplay"])} options={DATE_DISPLAY_OPTIONS} />
        </div>
      )}

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleClass}>Style Overrides</h3>
          <button type="button" onClick={addOverride}
            className="text-xs px-2 py-1 rounded-md border border-[var(--pb-border)] hover:bg-[var(--pb-surface-hover)] transition-colors text-[var(--pb-text-primary)]">+ Add Override</button>
        </div>
        <p className="text-xs text-[var(--pb-text-muted)] mb-3">
          Style specific testimonials differently based on company, relationship, rating, or hand-picked IDs.
        </p>

        {data.cardOverrides.length === 0 && (
          <p className="text-xs text-[var(--pb-text-muted)]">No overrides configured.</p>
        )}

        {data.cardOverrides.map((override, index) => {
          const isExpanded = expandedOverride === index;
          const targetDesc = Object.entries(override.target)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => {
              if (Array.isArray(v)) return `${k}: ${v.length} selected`;
              return `${k}: ${v}`;
            })
            .join(", ") || "No target set";

          return (
            <div key={index} className="border border-[var(--pb-border)] rounded-lg overflow-hidden bg-[var(--pb-surface)]">
              <button type="button" onClick={() => setExpandedOverride(isExpanded ? null : index)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left">
                <span className="text-xs text-[var(--pb-text-muted)]">Override {index + 1}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)] border border-[var(--pb-border)] capitalize">{override.style}</span>
                <span className="text-[10px] text-[var(--pb-text-muted)] truncate flex-1">{targetDesc}</span>
                <span className="text-[var(--pb-text-muted)] text-xs">{isExpanded ? "▲" : "▼"}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); removeOverride(index); }}
                  className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] px-1">✕</button>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-[var(--pb-border)] pt-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Target By</label>
                    <div className="flex flex-wrap gap-2">
                      {OVERRIDE_TARGET_OPTIONS.map((opt) => {
                        const isActive =
                          opt.id === "ids" ? "ids" in override.target :
                            opt.id === "companies" ? "companies" in override.target :
                              opt.id === "relationships" ? "relationships" in override.target :
                                opt.id === "ratings" ? "ratings" in override.target :
                                  opt.id === "is_featured" ? "is_featured" in override.target : false;

                        return (
                          <button key={opt.id} type="button" onClick={() => {
                            const next = { ...override.target } as Record<string, unknown>;
                            if (opt.id === "ids") {
                              if ("ids" in next) delete next.ids; else next.ids = [];
                            } else if (opt.id === "companies") {
                              if ("companies" in next) delete next.companies; else next.companies = [];
                            } else if (opt.id === "relationships") {
                              if ("relationships" in next) delete next.relationships; else next.relationships = [];
                            } else if (opt.id === "ratings") {
                              if ("ratings" in next) delete next.ratings; else next.ratings = [];
                            } else if (opt.id === "is_featured") {
                              if ("is_featured" in next) delete next.is_featured; else next.is_featured = true;
                            }
                            updateOverride(index, { target: next as TestimonialCardOverride["target"] });
                          }}
                            className={`text-xs px-2 py-1 rounded-md border transition-colors ${isActive
                                ? "border-[var(--pb-foreground)] bg-[var(--pb-foreground-10)] text-[var(--pb-text-primary)]"
                                : "border-[var(--pb-border)] text-[var(--pb-text-muted)] hover:border-[var(--pb-foreground-20)]"
                              }`}>{opt.code}</button>
                        );
                      })}
                    </div>
                  </div>

                  {override.target.ids !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Testimonial IDs</label>
                      <Dropdown id={`override-ids-${index}`} options={testimonialsOptions} multiple selectAll type="datalist"
                        placeholder="Search testimonials…" tag="testimonial" valueKey="id" displayKey="code" includeNoneOption={false}
                        value={override.target.ids ?? []}
                        onSelect={(val) => {
                          const ids = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, { target: { ...override.target, ids } });
                        }} />
                    </div>
                  )}

                  {override.target.companies !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Companies</label>
                      <Dropdown id={`override-companies-${index}`} options={companyOptions} multiple selectAll type="datalist"
                        placeholder="Search companies…" tag="company" valueKey="id" displayKey="code" includeNoneOption={false}
                        value={override.target.companies ?? []}
                        onSelect={(val) => {
                          const companies = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, { target: { ...override.target, companies } });
                        }} />
                    </div>
                  )}

                  {override.target.relationships !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Relationships</label>
                      <Dropdown id={`override-relationships-${index}`} options={relationshipOptions} multiple selectAll type="datalist"
                        placeholder="Search relationships…" tag="relationship" valueKey="id" displayKey="code" includeNoneOption={false}
                        value={override.target.relationships ?? []}
                        onSelect={(val) => {
                          const relationships = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, { target: { ...override.target, relationships } });
                        }} />
                    </div>
                  )}

                  {override.target.ratings !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Ratings</label>
                      <Dropdown id={`override-ratings-${index}`} options={ratingOptions} multiple selectAll type="datalist"
                        placeholder="Search ratings…" tag="rating" valueKey="id" displayKey="code" includeNoneOption={false}
                        value={override.target.ratings?.map(String) ?? []}
                        onSelect={(val) => {
                          const ratings = Array.isArray(val) ? val.map(Number) : val ? [Number(val)] : [];
                          updateOverride(index, { target: { ...override.target, ratings } });
                        }} />
                    </div>
                  )}

                  {override.target.is_featured !== undefined && (
                    <Toggle label="Target featured testimonials" checked={override.target.is_featured}
                      onChange={(v) => updateOverride(index, { target: { ...override.target, is_featured: v } })} />
                  )}

                  <SelectField label="Override Style" id={`override-style-${index}`} value={override.style}
                    onChange={(v) => updateOverride(index, { style: v as TestimonialCardStyle })} options={CARD_STYLE_OPTIONS} />

                  <div className="space-y-2">
                    <Toggle label="Show avatar (override)" checked={override.showAvatar ?? data.showAvatar} onChange={(v) => updateOverride(index, { showAvatar: v })} />
                    <Toggle label="Show author name (override)" checked={override.showAuthorName ?? data.showAuthorName} onChange={(v) => updateOverride(index, { showAuthorName: v })} />
                    <Toggle label="Show author title (override)" checked={override.showAuthorTitle ?? data.showAuthorTitle} onChange={(v) => updateOverride(index, { showAuthorTitle: v })} />
                    <Toggle label="Show author company (override)" checked={override.showAuthorCompany ?? data.showAuthorCompany} onChange={(v) => updateOverride(index, { showAuthorCompany: v })} />
                    <Toggle label="Show author relationship (override)" checked={override.showAuthorRelationship ?? data.showAuthorRelationship} onChange={(v) => updateOverride(index, { showAuthorRelationship: v })} />
                    <Toggle label="Show content (override)" checked={override.showContent ?? data.showContent} onChange={(v) => updateOverride(index, { showContent: v })} />
                    <Toggle label="Show rating (override)" checked={override.showRating ?? data.showRating} onChange={(v) => updateOverride(index, { showRating: v })} />
                    <Toggle label="Show date (override)" checked={override.showDate ?? data.showDate} onChange={(v) => updateOverride(index, { showDate: v })} />
                    <Toggle label="Show featured badge (override)" checked={override.showFeaturedBadge ?? data.showFeaturedBadge} onChange={(v) => updateOverride(index, { showFeaturedBadge: v })} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">Accent Color</label>
                    <ColorPicker id={`override-color-${index}`} value={override.accentColor || ""}
                      onChange={(v) => updateOverride(index, { accentColor: v || undefined })} placeholder="Default" />
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
