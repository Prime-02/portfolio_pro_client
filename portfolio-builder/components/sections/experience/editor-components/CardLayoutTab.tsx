// portfolio-builder/components/sections/experience/editor-components/CardLayoutTab.tsx

"use client";

import { useId, useMemo, useState } from "react";
import { ExperienceData, ExperienceCardStyle, ExperienceCardOverride, EmploymentType, LocationType } from "@/portfolio-builder/types/experience";
import SelectField from "../../bio/editor-components/SelectField";
import Toggle from "../../bio/editor-components/Toggle";
import ColorPicker from "../../bio/editor-components/ColorPicker";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";

// NOTE: Replace with your actual experience store hook
// import { useExperience } from "@/lib/stores/experience/useExperience";

interface CardLayoutTabProps {
  data: ExperienceData;
  onChange: <K extends keyof ExperienceData>(key: K, value: ExperienceData[K]) => void;
}

const CARD_STYLE_OPTIONS = [
  { value: "minimal", label: "Minimal — Company logo, title, duration" },
  { value: "compact", label: "Compact — Logo, title, company, meta tags" },
  { value: "standard", label: "Standard — Full info with date range" },
  { value: "detailed", label: "Detailed — Full info with skills section" },
  { value: "timeline", label: "Timeline — Left accent bar, chronological" },
];

const CARD_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "relative", label: "Relative (e.g. 2y ago)" },
  { value: "month-year", label: "Month Year (e.g. Jan 2023)" },
  { value: "year-only", label: "Year Only (e.g. 2023)" },
  { value: "full-date", label: "Full Date (e.g. Jan 15, 2023)" },
];

const OVERRIDE_TARGET_OPTIONS = [
  { id: "ids", code: "Specific Experience IDs" },
  { id: "industries", code: "Industries" },
  { id: "employment_types", code: "Employment Types" },
  { id: "location_types", code: "Location Types" },
  { id: "is_featured", code: "Featured" },
  { id: "is_current", code: "Current" },
];

export default function CardLayoutTab({ data, onChange }: CardLayoutTabProps) {
  const [expandedOverride, setExpandedOverride] = useState<number | null>(null);
  // const { experiences } = useExperience();
  const experiences: Array<{ id?: string; job_title: string; company_name: string; industry?: string | null; employment_type?: string | null; location_type?: string | null }> = [];

  // ── Dropdown option arrays derived from the experience store ────────────

  const experienceOptions = useMemo(
    () => experiences.map((exp) => ({ id: exp.id || useId(), code: `${exp.job_title} @ ${exp.company_name}` })),
    [experiences]
  );

  const industryOptions = useMemo(() => {
    const seen = new Set<string>();
    return experiences
      .map((e) => e.industry)
      .filter((i): i is string => !!i && !seen.has(i) && !!seen.add(i))
      .map((i) => ({ id: i, code: i }));
  }, [experiences]);

  const employmentTypeOptions = useMemo(() => {
    const seen = new Set<string>();
    return experiences
      .map((e) => e.employment_type)
      .filter((t): t is string => !!t && !seen.has(t) && !!seen.add(t))
      .map((t) => ({ id: t, code: t }));
  }, [experiences]);

  const locationTypeOptions = useMemo(() => {
    const seen = new Set<string>();
    return experiences
      .map((e) => e.location_type)
      .filter((t): t is string => !!t && !seen.has(t) && !!seen.add(t))
      .map((t) => ({ id: t, code: t }));
  }, [experiences]);

  // ─────────────────────────────────────────────────────────────────────────

  const updateOverride = (index: number, updates: Partial<ExperienceCardOverride>) => {
    const updated = [...data.cardOverrides];
    updated[index] = { ...updated[index], ...updates };
    onChange("cardOverrides", updated);
  };

  const removeOverride = (index: number) => {
    onChange("cardOverrides", data.cardOverrides.filter((_, i) => i !== index));
  };

  const addOverride = () => {
    const newOverride: ExperienceCardOverride = {
      target: {},
      style: "detailed",
    };
    onChange("cardOverrides", [...data.cardOverrides, newOverride]);
    setExpandedOverride(data.cardOverrides.length);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Default Card Style ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Default Card Style</h3>
        <SelectField
          label="Card Style"
          id="cardStyle"
          value={data.cardStyle}
          onChange={(v) => onChange("cardStyle", v as ExperienceCardStyle)}
          options={CARD_STYLE_OPTIONS}
        />
        <SelectField
          label="Card Size"
          id="cardSize"
          value={data.cardSize}
          onChange={(v) => onChange("cardSize", v as "small" | "medium" | "large")}
          options={CARD_SIZE_OPTIONS}
        />
        <SelectField
          label="Date Display Format"
          id="dateDisplayFormat"
          value={data.dateDisplayFormat}
          onChange={(v) => onChange("dateDisplayFormat", v as ExperienceData["dateDisplayFormat"])}
          options={DATE_FORMAT_OPTIONS}
        />
      </div>

      {/* ── Display Options ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Display Options</h3>
        <div className="space-y-3">
          <Toggle
            label="Show company logo"
            checked={data.showCompanyLogo}
            onChange={(v) => onChange("showCompanyLogo", v)}
          />
          <Toggle
            label="Show job title"
            checked={data.showJobTitle}
            onChange={(v) => onChange("showJobTitle", v)}
          />
          <Toggle
            label="Show company name"
            checked={data.showCompanyName}
            onChange={(v) => onChange("showCompanyName", v)}
          />
          <Toggle
            label="Show description"
            checked={data.showDescription}
            onChange={(v) => onChange("showDescription", v)}
          />
          <Toggle
            label="Show employment type"
            checked={data.showEmploymentType}
            onChange={(v) => onChange("showEmploymentType", v)}
          />
          <Toggle
            label="Show location type"
            checked={data.showLocationType}
            onChange={(v) => onChange("showLocationType", v)}
          />
          <Toggle
            label="Show duration"
            checked={data.showDuration}
            onChange={(v) => onChange("showDuration", v)}
          />
          <Toggle
            label="Show skills/tags"
            checked={data.showSkills}
            onChange={(v) => onChange("showSkills", v)}
          />
        </div>
      </div>

      {/* ── Card Overrides ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleClass}>Style Overrides</h3>
          <button
            type="button"
            onClick={addOverride}
            className="text-xs px-2 py-1 rounded-md border border-[var(--pb-border)] hover:bg-[var(--pb-surface-hover)] transition-colors text-[var(--pb-text-primary)]"
          >
            + Add Override
          </button>
        </div>
        <p className="text-xs text-[var(--pb-text-muted)] mb-3">
          Style specific experiences differently based on industry, employment type, or hand-picked IDs.
        </p>

        {data.cardOverrides.length === 0 && (
          <p className="text-xs text-[var(--pb-text-muted)]">No overrides configured.</p>
        )}

        {data.cardOverrides.map((override, index) => {
          const isExpanded = expandedOverride === index;
          const targetDesc =
            Object.entries(override.target)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => {
                if (Array.isArray(v)) return `${k}: ${v.length} selected`;
                return `${k}: ${v}`;
              })
              .join(", ") || "No target set";

          return (
            <div
              key={index}
              className="border border-[var(--pb-border)] rounded-lg overflow-hidden bg-[var(--pb-surface)]"
            >
              <button
                type="button"
                onClick={() => setExpandedOverride(isExpanded ? null : index)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
              >
                <span className="text-xs text-[var(--pb-text-muted)]">Override {index + 1}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)] border border-[var(--pb-border)] capitalize">
                  {override.style}
                </span>
                <span className="text-[10px] text-[var(--pb-text-muted)] truncate flex-1">
                  {targetDesc}
                </span>
                <span className="text-[var(--pb-text-muted)] text-xs">{isExpanded ? "▲" : "▼"}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOverride(index);
                  }}
                  className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] px-1"
                >
                  ✕
                </button>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-[var(--pb-border)] pt-3">
                  {/* ── Target type toggle pills ── */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                      Target By
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OVERRIDE_TARGET_OPTIONS.map((opt) => {
                        const isActive =
                          opt.id === "ids"
                            ? "ids" in override.target
                            : opt.id === "industries"
                              ? "industries" in override.target
                              : opt.id === "employment_types"
                                ? "employment_types" in override.target
                                : opt.id === "location_types"
                                  ? "location_types" in override.target
                                  : opt.id === "is_featured"
                                    ? "is_featured" in override.target
                                    : opt.id === "is_current"
                                      ? "is_current" in override.target
                                      : false;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              const next = { ...override.target } as Record<string, unknown>;
                              if (opt.id === "ids") {
                                if ("ids" in next) delete next.ids;
                                else next.ids = [];
                              } else if (opt.id === "industries") {
                                if ("industries" in next) delete next.industries;
                                else next.industries = [];
                              } else if (opt.id === "employment_types") {
                                if ("employment_types" in next) delete next.employment_types;
                                else next.employment_types = [];
                              } else if (opt.id === "location_types") {
                                if ("location_types" in next) delete next.location_types;
                                else next.location_types = [];
                              } else if (opt.id === "is_featured") {
                                if ("is_featured" in next) delete next.is_featured;
                                else next.is_featured = true;
                              } else if (opt.id === "is_current") {
                                if ("is_current" in next) delete next.is_current;
                                else next.is_current = true;
                              }
                              updateOverride(index, { target: next as ExperienceCardOverride["target"] });
                            }}
                            className={`text-xs px-2 py-1 rounded-md border transition-colors ${isActive
                              ? "border-[var(--pb-foreground)] bg-[var(--pb-foreground-10)] text-[var(--pb-text-primary)]"
                              : "border-[var(--pb-border)] text-[var(--pb-text-muted)] hover:border-[var(--pb-foreground-20)]"
                              }`}
                          >
                            {opt.code}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Experience IDs ── */}
                  {override.target.ids !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Experience IDs
                      </label>
                      <Dropdown
                        id={`override-ids-${index}`}
                        options={experienceOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search experiences..."
                        tag="experience"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.ids ?? []}
                        onSelect={(val) => {
                          const ids = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, ids },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── Industries ── */}
                  {override.target.industries !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Industries
                      </label>
                      <Dropdown
                        id={`override-industries-${index}`}
                        options={industryOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search industries..."
                        tag="industry"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.industries ?? []}
                        onSelect={(val) => {
                          const industries = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, industries },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── Employment Types ── */}
                  {override.target.employment_types !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Employment Types
                      </label>
                      <Dropdown
                        id={`override-employment-types-${index}`}
                        options={employmentTypeOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search employment types..."
                        tag="type"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.employment_types ?? []}
                        onSelect={(val) => {
                          const employment_types = (Array.isArray(val) ? val : val ? [val] : []) as EmploymentType[];
                          updateOverride(index, {
                            target: { ...override.target, employment_types },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── Location Types ── */}
                  {override.target.location_types !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Location Types
                      </label>
                      <Dropdown
                        id={`override-location-types-${index}`}
                        options={locationTypeOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search location types..."
                        tag="type"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.location_types ?? []}
                        onSelect={(val) => {
                          const location_types = (Array.isArray(val) ? val : val ? [val] : []) as LocationType[];
                          updateOverride(index, {
                            target: { ...override.target, location_types },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── is_featured toggle ── */}
                  {override.target.is_featured !== undefined && (
                    <Toggle
                      label="Target featured experiences"
                      checked={override.target.is_featured}
                      onChange={(v) =>
                        updateOverride(index, { target: { ...override.target, is_featured: v } })
                      }
                    />
                  )}

                  {/* ── is_current toggle ── */}
                  {override.target.is_current !== undefined && (
                    <Toggle
                      label="Target current experiences"
                      checked={override.target.is_current}
                      onChange={(v) =>
                        updateOverride(index, { target: { ...override.target, is_current: v } })
                      }
                    />
                  )}

                  {/* ── Override style ── */}
                  <SelectField
                    label="Override Style"
                    id={`override-style-${index}`}
                    value={override.style}
                    onChange={(v) => updateOverride(index, { style: v as ExperienceCardStyle })}
                    options={CARD_STYLE_OPTIONS}
                  />

                  {/* ── Override display toggles ── */}
                  <div className="space-y-2">
                    <Toggle
                      label="Show company logo (override)"
                      checked={override.showCompanyLogo ?? data.showCompanyLogo}
                      onChange={(v) => updateOverride(index, { showCompanyLogo: v })}
                    />
                    <Toggle
                      label="Show job title (override)"
                      checked={override.showJobTitle ?? data.showJobTitle}
                      onChange={(v) => updateOverride(index, { showJobTitle: v })}
                    />
                    <Toggle
                      label="Show company name (override)"
                      checked={override.showCompanyName ?? data.showCompanyName}
                      onChange={(v) => updateOverride(index, { showCompanyName: v })}
                    />
                    <Toggle
                      label="Show description (override)"
                      checked={override.showDescription ?? data.showDescription}
                      onChange={(v) => updateOverride(index, { showDescription: v })}
                    />
                    <Toggle
                      label="Show employment type (override)"
                      checked={override.showEmploymentType ?? data.showEmploymentType}
                      onChange={(v) => updateOverride(index, { showEmploymentType: v })}
                    />
                    <Toggle
                      label="Show location type (override)"
                      checked={override.showLocationType ?? data.showLocationType}
                      onChange={(v) => updateOverride(index, { showLocationType: v })}
                    />
                    <Toggle
                      label="Show duration (override)"
                      checked={override.showDuration ?? data.showDuration}
                      onChange={(v) => updateOverride(index, { showDuration: v })}
                    />
                    <Toggle
                      label="Show skills (override)"
                      checked={override.showSkills ?? data.showSkills}
                      onChange={(v) => updateOverride(index, { showSkills: v })}
                    />
                  </div>

                  {/* ── Accent color ── */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                      Accent Color
                    </label>
                    <ColorPicker
                      id={`override-color-${index}`}
                      value={override.accentColor || ""}
                      onChange={(v) => updateOverride(index, { accentColor: v || undefined })}
                      placeholder="Default"
                    />
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
