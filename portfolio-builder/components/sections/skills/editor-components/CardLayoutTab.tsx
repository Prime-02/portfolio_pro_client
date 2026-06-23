// portfolio-builder/components/sections/skills/editor-components/CardLayoutTab.tsx

"use client";

import { useId, useMemo, useState } from "react";
import { SkillsData, SkillCardStyle, SkillCardOverride } from "@/portfolio-builder/types/skills";
import SelectField from "../../bio/editor-components/SelectField";
import Toggle from "../../bio/editor-components/Toggle";
import ColorPicker from "../../bio/editor-components/ColorPicker";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { useSkills } from "@/lib/stores/skills/useSkills";
import { difficultyLevels } from "@/lib/utilities/indices/DropDownItems";

interface CardLayoutTabProps {
  data: SkillsData;
  onChange: <K extends keyof SkillsData>(key: K, value: SkillsData[K]) => void;
}

const CARD_STYLE_OPTIONS = [
  { value: "compact", label: "Compact — Minimal, icon + name + dots" },
  { value: "standard", label: "Standard — Logo, name, description, dots" },
  { value: "detailed", label: "Detailed — Full info with badges" },
  { value: "badge", label: "Badge — Pill-style tag" },
  { value: "progress", label: "Progress — Bar indicator for proficiency" },
];

const CARD_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const PROFICIENCY_DISPLAY_OPTIONS = [
  { value: "dots", label: "Dots" },
  { value: "text", label: "Text only" },
  { value: "bar", label: "Progress bar" },
  { value: "badge", label: "Badge" },
  { value: "hidden", label: "Hidden" },
];

const DIFFICULTY_DISPLAY_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "badge", label: "Badge" },
  { value: "hidden", label: "Hidden" },
];

const OVERRIDE_TARGET_OPTIONS = [
  { id: "ids", code: "Specific Skill IDs" },
  { id: "categories", code: "Categories" },
  { id: "subcategories", code: "Subcategories" },
  { id: "is_major", code: "Major Skills" },
  { id: "difficulty_level", code: "Difficulty Level" },
];

export default function CardLayoutTab({ data, onChange }: CardLayoutTabProps) {
  const [expandedOverride, setExpandedOverride] = useState<number | null>(null);
  const { skills } = useSkills();

  // ── Dropdown option arrays derived from the skills store ──────────────────

  const skillsOptions = useMemo(
    () => skills.map((skill) => ({ id: skill.id || useId(), code: skill.skill_name })),
    [skills]
  );

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    return skills
      .map((s) => s.category)
      .filter((c): c is string => !!c && !seen.has(c) && !!seen.add(c))
      .map((c) => ({ id: c, code: c }));
  }, [skills]);

  const subcategoryOptions = useMemo(() => {
    const seen = new Set<string>();
    return skills
      .map((s) => s.subcategory)
      .filter((sc): sc is string => !!sc && !seen.has(sc) && !!seen.add(sc))
      .map((sc) => ({ id: sc, code: sc }));
  }, [skills]);

  // ─────────────────────────────────────────────────────────────────────────

  const updateOverride = (index: number, updates: Partial<SkillCardOverride>) => {
    const updated = [...data.cardOverrides];
    updated[index] = { ...updated[index], ...updates };
    onChange("cardOverrides", updated);
  };

  const removeOverride = (index: number) => {
    onChange("cardOverrides", data.cardOverrides.filter((_, i) => i !== index));
  };

  const addOverride = () => {
    const newOverride: SkillCardOverride = {
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
          onChange={(v) => onChange("cardStyle", v as SkillCardStyle)}
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

      {/* ── Display Options ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Display Options</h3>
        <div className="space-y-3">
          <Toggle
            label="Show skill logo"
            checked={data.showLogo}
            onChange={(v) => onChange("showLogo", v)}
          />
          <Toggle
            label="Show description"
            checked={data.showDescription}
            onChange={(v) => onChange("showDescription", v)}
          />
          <Toggle
            label="Show category badge"
            checked={data.showCategory}
            onChange={(v) => onChange("showCategory", v)}
          />
        </div>
      </div>

      {/* ── Proficiency ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Proficiency Display</h3>
        <Toggle
          label="Show proficiency"
          checked={data.showProficiency}
          onChange={(v) => onChange("showProficiency", v)}
        />
        {data.showProficiency && (
          <SelectField
            label="Display Style"
            id="proficiencyDisplay"
            value={data.proficiencyDisplay}
            onChange={(v) => onChange("proficiencyDisplay", v as SkillsData["proficiencyDisplay"])}
            options={PROFICIENCY_DISPLAY_OPTIONS}
          />
        )}
      </div>

      {/* ── Difficulty ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Difficulty Display</h3>
        <Toggle
          label="Show difficulty level"
          checked={data.showDifficulty}
          onChange={(v) => onChange("showDifficulty", v)}
        />
        {data.showDifficulty && (
          <SelectField
            label="Display Style"
            id="difficultyDisplay"
            value={data.difficultyDisplay}
            onChange={(v) => onChange("difficultyDisplay", v as SkillsData["difficultyDisplay"])}
            options={DIFFICULTY_DISPLAY_OPTIONS}
          />
        )}
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
          Style specific skills differently based on category, difficulty, or hand-picked IDs.
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
                            : opt.id === "categories"
                              ? "categories" in override.target
                              : opt.id === "subcategories"
                                ? "subcategories" in override.target
                                : opt.id === "is_major"
                                  ? "is_major" in override.target
                                  : opt.id === "difficulty_level"
                                    ? "difficulty_level" in override.target
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
                              } else if (opt.id === "categories") {
                                if ("categories" in next) delete next.categories;
                                else next.categories = [];
                              } else if (opt.id === "subcategories") {
                                if ("subcategories" in next) delete next.subcategories;
                                else next.subcategories = [];
                              } else if (opt.id === "is_major") {
                                if ("is_major" in next) delete next.is_major;
                                else next.is_major = true;
                              } else if (opt.id === "difficulty_level") {
                                if ("difficulty_level" in next) delete next.difficulty_level;
                                else next.difficulty_level = [];
                              }
                              updateOverride(index, { target: next as SkillCardOverride["target"] });
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

                  {/* ── Skill IDs — searchable multi-select dropdown ── */}
                  {override.target.ids !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Skill IDs
                      </label>
                      <Dropdown
                        id={`override-ids-${index}`}
                        options={skillsOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search skills…"
                        tag="skill"
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

                  {/* ── Categories — multi-select dropdown ── */}
                  {override.target.categories !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Categories
                      </label>
                      <Dropdown
                        id={`override-categories-${index}`}
                        options={categoryOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search categories…"
                        tag="category"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.categories ?? []}
                        onSelect={(val) => {
                          const categories = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, categories },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── Subcategories — multi-select dropdown ── */}
                  {override.target.subcategories !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Subcategories
                      </label>
                      <Dropdown
                        id={`override-subcategories-${index}`}
                        options={subcategoryOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search subcategories…"
                        tag="subcategory"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.subcategories ?? []}
                        onSelect={(val) => {
                          const subcategories = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, subcategories },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── is_major toggle ── */}
                  {override.target.is_major !== undefined && (
                    <Toggle
                      label="Target major skills"
                      checked={override.target.is_major}
                      onChange={(v) =>
                        updateOverride(index, { target: { ...override.target, is_major: v } })
                      }
                    />
                  )}

                  {/* ── difficulty_level dropdown ── */}
                  {override.target.difficulty_level !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Difficulty Level
                      </label>
                      <Dropdown
                        id={`override-difficulty-${index}`}
                        options={difficultyLevels}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Select difficulty levels…"
                        tag="level"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={
                          Array.isArray(override.target.difficulty_level)
                            ? override.target.difficulty_level
                            : override.target.difficulty_level
                              ? [override.target.difficulty_level]
                              : []
                        }
                        onSelect={(val) =>
                          updateOverride(index, {
                            target: {
                              ...override.target,
                              difficulty_level: Array.isArray(val) ? val : val ? [val] : [],
                            },
                          })
                        }
                      />
                    </div>
                  )}

                  {/* ── Override style ── */}
                  <SelectField
                    label="Override Style"
                    id={`override-style-${index}`}
                    value={override.style}
                    onChange={(v) => updateOverride(index, { style: v as SkillCardStyle })}
                    options={CARD_STYLE_OPTIONS}
                  />

                  {/* ── Override display toggles ── */}
                  <div className="space-y-2">
                    <Toggle
                      label="Show logo (override)"
                      checked={override.showLogo ?? data.showLogo}
                      onChange={(v) => updateOverride(index, { showLogo: v })}
                    />
                    <Toggle
                      label="Show description (override)"
                      checked={override.showDescription ?? data.showDescription}
                      onChange={(v) => updateOverride(index, { showDescription: v })}
                    />
                    <Toggle
                      label="Show proficiency (override)"
                      checked={override.showProficiency ?? data.showProficiency}
                      onChange={(v) => updateOverride(index, { showProficiency: v })}
                    />
                    <Toggle
                      label="Show difficulty (override)"
                      checked={override.showDifficulty ?? data.showDifficulty}
                      onChange={(v) => updateOverride(index, { showDifficulty: v })}
                    />
                    <Toggle
                      label="Show category (override)"
                      checked={override.showCategory ?? data.showCategory}
                      onChange={(v) => updateOverride(index, { showCategory: v })}
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