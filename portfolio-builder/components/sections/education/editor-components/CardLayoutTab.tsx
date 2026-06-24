// portfolio-builder/components/sections/education/editor-components/CardLayoutTab.tsx

"use client";

import { useId, useMemo, useState } from "react";
import { EducationData, EducationCardStyle, EducationCardOverride } from "@/portfolio-builder/types/education";
import SelectField from "../../bio/editor-components/SelectField";
import Toggle from "../../bio/editor-components/Toggle";
import ColorPicker from "../../bio/editor-components/ColorPicker";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { useEducation } from "@/lib/stores/education/useEducation";

interface CardLayoutTabProps {
  data: EducationData;
  onChange: <K extends keyof EducationData>(key: K, value: EducationData[K]) => void;
}

const CARD_STYLE_OPTIONS = [
  { value: "academic", label: "Academic — Institution logo, degree, dates" },
  { value: "compact", label: "Compact — Logo, institution, degree, meta" },
  { value: "standard", label: "Standard — Full info with date range" },
  { value: "detailed", label: "Detailed — Full info with description" },
  { value: "transcript", label: "Transcript — Left accent bar, chronological" },
  { value: "diploma", label: "Diploma — Decorative corner accent, formal" },
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
  { id: "ids", code: "Specific Education IDs" },
  { id: "institutions", code: "Institutions" },
  { id: "degrees", code: "Degrees" },
  { id: "fields_of_study", code: "Fields of Study" },
  { id: "is_current", code: "Current" },
];

export default function CardLayoutTab({ data, onChange }: CardLayoutTabProps) {
  const [expandedOverride, setExpandedOverride] = useState<number | null>(null);
  const { educations } = useEducation();

  // ── Dropdown option arrays derived from the education store ────────────

  const educationOptions = useMemo(
    () => educations.map((edu) => ({ id: edu.id || useId(), code: `${edu.institution} — ${edu.degree}` })),
    [educations]
  );

  const institutionOptions = useMemo(() => {
    const seen = new Set<string>();
    return educations
      .map((e) => e.institution)
      .filter((i): i is string => !!i && !seen.has(i) && !!seen.add(i))
      .map((i) => ({ id: i, code: i }));
  }, [educations]);

  const degreeOptions = useMemo(() => {
    const seen = new Set<string>();
    return educations
      .map((e) => e.degree)
      .filter((d): d is string => !!d && !seen.has(d) && !!seen.add(d))
      .map((d) => ({ id: d, code: d }));
  }, [educations]);

  const fieldOfStudyOptions = useMemo(() => {
    const seen = new Set<string>();
    return educations
      .map((e) => e.field_of_study)
      .filter((f): f is string => !!f && !seen.has(f) && !!seen.add(f))
      .map((f) => ({ id: f, code: f }));
  }, [educations]);

  // ─────────────────────────────────────────────────────────────────────────

  const updateOverride = (index: number, updates: Partial<EducationCardOverride>) => {
    const updated = [...data.cardOverrides];
    updated[index] = { ...updated[index], ...updates };
    onChange("cardOverrides", updated);
  };

  const removeOverride = (index: number) => {
    onChange("cardOverrides", data.cardOverrides.filter((_, i) => i !== index));
  };

  const addOverride = () => {
    const newOverride: EducationCardOverride = {
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
          onChange={(v) => onChange("cardStyle", v as EducationCardStyle)}
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
          onChange={(v) => onChange("dateDisplayFormat", v as EducationData["dateDisplayFormat"])}
          options={DATE_FORMAT_OPTIONS}
        />
      </div>

      {/* ── Display Options ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Display Options</h3>
        <div className="space-y-3">
          <Toggle
            label="Show institution logo"
            checked={data.showInstitutionLogo}
            onChange={(v) => onChange("showInstitutionLogo", v)}
          />
          <Toggle
            label="Show institution name"
            checked={data.showInstitution}
            onChange={(v) => onChange("showInstitution", v)}
          />
          <Toggle
            label="Show degree"
            checked={data.showDegree}
            onChange={(v) => onChange("showDegree", v)}
          />
          <Toggle
            label="Show field of study"
            checked={data.showFieldOfStudy}
            onChange={(v) => onChange("showFieldOfStudy", v)}
          />
          <Toggle
            label="Show dates"
            checked={data.showDates}
            onChange={(v) => onChange("showDates", v)}
          />
          <Toggle
            label="Show duration"
            checked={data.showDuration}
            onChange={(v) => onChange("showDuration", v)}
          />
          <Toggle
            label="Show description"
            checked={data.showDescription}
            onChange={(v) => onChange("showDescription", v)}
          />
          <Toggle
            label="Show current indicator"
            checked={data.showCurrentIndicator}
            onChange={(v) => onChange("showCurrentIndicator", v)}
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
          Style specific education entries differently based on institution, degree, or hand-picked IDs.
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
                            : opt.id === "institutions"
                              ? "institutions" in override.target
                              : opt.id === "degrees"
                                ? "degrees" in override.target
                                : opt.id === "fields_of_study"
                                  ? "fields_of_study" in override.target
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
                              } else if (opt.id === "institutions") {
                                if ("institutions" in next) delete next.institutions;
                                else next.institutions = [];
                              } else if (opt.id === "degrees") {
                                if ("degrees" in next) delete next.degrees;
                                else next.degrees = [];
                              } else if (opt.id === "fields_of_study") {
                                if ("fields_of_study" in next) delete next.fields_of_study;
                                else next.fields_of_study = [];
                              } else if (opt.id === "is_current") {
                                if ("is_current" in next) delete next.is_current;
                                else next.is_current = true;
                              }
                              updateOverride(index, { target: next as EducationCardOverride["target"] });
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

                  {/* ── Education IDs ── */}
                  {override.target.ids !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Education IDs
                      </label>
                      <Dropdown
                        id={`override-ids-${index}`}
                        options={educationOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search educations..."
                        tag="education"
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

                  {/* ── Institutions ── */}
                  {override.target.institutions !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Institutions
                      </label>
                      <Dropdown
                        id={`override-institutions-${index}`}
                        options={institutionOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search institutions..."
                        tag="institution"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.institutions ?? []}
                        onSelect={(val) => {
                          const institutions = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, institutions },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── Degrees ── */}
                  {override.target.degrees !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Degrees
                      </label>
                      <Dropdown
                        id={`override-degrees-${index}`}
                        options={degreeOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search degrees..."
                        tag="degree"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.degrees ?? []}
                        onSelect={(val) => {
                          const degrees = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, degrees },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── Fields of Study ── */}
                  {override.target.fields_of_study !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Fields of Study
                      </label>
                      <Dropdown
                        id={`override-fields-${index}`}
                        options={fieldOfStudyOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search fields of study..."
                        tag="field"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.fields_of_study ?? []}
                        onSelect={(val) => {
                          const fields_of_study = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, fields_of_study },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── is_current toggle ── */}
                  {override.target.is_current !== undefined && (
                    <Toggle
                      label="Target current educations"
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
                    onChange={(v) => updateOverride(index, { style: v as EducationCardStyle })}
                    options={CARD_STYLE_OPTIONS}
                  />

                  {/* ── Override display toggles ── */}
                  <div className="space-y-2">
                    <Toggle
                      label="Show institution logo (override)"
                      checked={override.showInstitutionLogo ?? data.showInstitutionLogo}
                      onChange={(v) => updateOverride(index, { showInstitutionLogo: v })}
                    />
                    <Toggle
                      label="Show institution name (override)"
                      checked={override.showInstitution ?? data.showInstitution}
                      onChange={(v) => updateOverride(index, { showInstitution: v })}
                    />
                    <Toggle
                      label="Show degree (override)"
                      checked={override.showDegree ?? data.showDegree}
                      onChange={(v) => updateOverride(index, { showDegree: v })}
                    />
                    <Toggle
                      label="Show field of study (override)"
                      checked={override.showFieldOfStudy ?? data.showFieldOfStudy}
                      onChange={(v) => updateOverride(index, { showFieldOfStudy: v })}
                    />
                    <Toggle
                      label="Show dates (override)"
                      checked={override.showDates ?? data.showDates}
                      onChange={(v) => updateOverride(index, { showDates: v })}
                    />
                    <Toggle
                      label="Show duration (override)"
                      checked={override.showDuration ?? data.showDuration}
                      onChange={(v) => updateOverride(index, { showDuration: v })}
                    />
                    <Toggle
                      label="Show description (override)"
                      checked={override.showDescription ?? data.showDescription}
                      onChange={(v) => updateOverride(index, { showDescription: v })}
                    />
                    <Toggle
                      label="Show current indicator (override)"
                      checked={override.showCurrentIndicator ?? data.showCurrentIndicator}
                      onChange={(v) => updateOverride(index, { showCurrentIndicator: v })}
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
