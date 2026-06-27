// portfolio-builder/components/sections/projects/editor-components/ProjectsCardLayoutTab.tsx

"use client";

import { useId, useMemo, useState } from "react";
import { ProjectsData, ProjectCardStyle, ProjectCardOverride } from "@/portfolio-builder/types/projects";
import SelectField from "../../bio/editor-components/SelectField";
import Toggle from "../../bio/editor-components/Toggle";
import ColorPicker from "../../bio/editor-components/ColorPicker";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import { ProjectStatus } from "@/lib/stores/projects/types/project.types";

interface ProjectsCardLayoutTabProps {
  data: ProjectsData;
  onChange: <K extends keyof ProjectsData>(key: K, value: ProjectsData[K]) => void;
}

const CARD_STYLE_OPTIONS = [
  { value: "compact", label: "Compact — Minimal, image + name + status" },
  { value: "standard", label: "Standard — Image, name, description, metadata" },
  { value: "detailed", label: "Detailed — Full info with stack, dates, client" },
  { value: "minimal", label: "Minimal — Text-only list item style" },
  { value: "hero", label: "Hero — Large featured card with full bleed image" },
];

const CARD_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const DATE_DISPLAY_OPTIONS = [
  { value: "relative", label: "Relative (e.g., '2 months ago')" },
  { value: "absolute", label: "Absolute (e.g., 'Jan 2024')" },
  { value: "hidden", label: "Hidden" },
];

const STATUS_DISPLAY_OPTIONS = [
  { value: "badge", label: "Badge" },
  { value: "text", label: "Text only" },
  { value: "hidden", label: "Hidden" },
];

const PLATFORM_DISPLAY_OPTIONS = [
  { value: "icon", label: "Icon" },
  { value: "text", label: "Text" },
  { value: "badge", label: "Badge" },
  { value: "hidden", label: "Hidden" },
];

const CATEGORY_DISPLAY_OPTIONS = [
  { value: "badge", label: "Badge" },
  { value: "text", label: "Text" },
  { value: "hidden", label: "Hidden" },
];

const OVERRIDE_TARGET_OPTIONS = [
  { id: "ids", code: "Specific Project IDs" },
  { id: "categories", code: "Categories" },
  { id: "platforms", code: "Platforms" },
  { id: "statuses", code: "Statuses" },
  { id: "is_completed", code: "Completion Status" },
  { id: "is_concept", code: "Concept Status" },
];

export default function ProjectsCardLayoutTab({ data, onChange }: ProjectsCardLayoutTabProps) {
  const [expandedOverride, setExpandedOverride] = useState<number | null>(null);
  const { projects } = useProjectStore();

  // ── Dropdown option arrays derived from the projects store ──────────────────

  const projectsOptions = useMemo(
    () => projects.map((project) => ({ id: project.id || useId(), code: project.project_name })),
    [projects]
  );

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    return projects
      .map((p) => p.project_category)
      .filter((c): c is string => !!c && !seen.has(c) && !!seen.add(c))
      .map((c) => ({ id: c, code: c }));
  }, [projects]);

  const platformOptions = useMemo(() => {
    const seen = new Set<string>();
    return projects
      .map((p) => p.project_platform)
      .filter((p): p is string => !!p && !seen.has(p) && !!seen.add(p))
      .map((p) => ({ id: p, code: p }));
  }, [projects]);

  const statusOptions = useMemo(() => {
    const seen = new Set<ProjectStatus>();
    return projects
      .map((p) => p.status)
      .filter((s): s is ProjectStatus => !!s && !seen.has(s) && !!seen.add(s))
      .map((s) => ({ id: s, code: s }));
  }, [projects]);
  // ─────────────────────────────────────────────────────────────────────────

  const updateOverride = (index: number, updates: Partial<ProjectCardOverride>) => {
    const updated = [...data.cardOverrides];
    updated[index] = { ...updated[index], ...updates };
    onChange("cardOverrides", updated);
  };

  const removeOverride = (index: number) => {
    onChange("cardOverrides", data.cardOverrides.filter((_, i) => i !== index));
  };

  const addOverride = () => {
    const newOverride: ProjectCardOverride = {
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
          onChange={(v) => onChange("cardStyle", v as ProjectCardStyle)}
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
            label="Show project image"
            checked={data.showImage}
            onChange={(v) => onChange("showImage", v)}
          />
          <Toggle
            label="Show description"
            checked={data.showDescription}
            onChange={(v) => onChange("showDescription", v)}
          />
          <Toggle
            label="Show project URL"
            checked={data.showUrl}
            onChange={(v) => onChange("showUrl", v)}
          />
          <Toggle
            label="Show dates"
            checked={data.showDates}
            onChange={(v) => onChange("showDates", v)}
          />
          <Toggle
            label="Show status"
            checked={data.showStatus}
            onChange={(v) => onChange("showStatus", v)}
          />
          <Toggle
            label="Show platform"
            checked={data.showPlatform}
            onChange={(v) => onChange("showPlatform", v)}
          />
          <Toggle
            label="Show category"
            checked={data.showCategory}
            onChange={(v) => onChange("showCategory", v)}
          />
          <Toggle
            label="Show tech stack"
            checked={data.showStack}
            onChange={(v) => onChange("showStack", v)}
          />
          <Toggle
            label="Show budget"
            checked={data.showBudget}
            onChange={(v) => onChange("showBudget", v)}
          />
          <Toggle
            label="Show client name"
            checked={data.showClient}
            onChange={(v) => onChange("showClient", v)}
          />
          <Toggle
            label="Show contribution"
            checked={data.showContribution}
            onChange={(v) => onChange("showContribution", v)}
          />
        </div>
      </div>

      {/* ── Date Display ── */}
      {data.showDates && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Date Display</h3>
          <SelectField
            label="Display Style"
            id="dateDisplay"
            value={data.dateDisplay}
            onChange={(v) => onChange("dateDisplay", v as ProjectsData["dateDisplay"])}
            options={DATE_DISPLAY_OPTIONS}
          />
        </div>
      )}

      {/* ── Status Display ── */}
      {data.showStatus && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Status Display</h3>
          <SelectField
            label="Display Style"
            id="statusDisplay"
            value={data.statusDisplay}
            onChange={(v) => onChange("statusDisplay", v as ProjectsData["statusDisplay"])}
            options={STATUS_DISPLAY_OPTIONS}
          />
        </div>
      )}

      {/* ── Platform Display ── */}
      {data.showPlatform && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Platform Display</h3>
          <SelectField
            label="Display Style"
            id="platformDisplay"
            value={data.platformDisplay}
            onChange={(v) => onChange("platformDisplay", v as ProjectsData["platformDisplay"])}
            options={PLATFORM_DISPLAY_OPTIONS}
          />
        </div>
      )}

      {/* ── Category Display ── */}
      {data.showCategory && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Category Display</h3>
          <SelectField
            label="Display Style"
            id="categoryDisplay"
            value={data.categoryDisplay}
            onChange={(v) => onChange("categoryDisplay", v as ProjectsData["categoryDisplay"])}
            options={CATEGORY_DISPLAY_OPTIONS}
          />
        </div>
      )}

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
          Style specific projects differently based on category, platform, status, or hand-picked IDs.
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
                              : opt.id === "platforms"
                                ? "platforms" in override.target
                                : opt.id === "statuses"
                                  ? "statuses" in override.target
                                  : opt.id === "is_completed"
                                    ? "is_completed" in override.target
                                    : opt.id === "is_concept"
                                      ? "is_concept" in override.target
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
                              } else if (opt.id === "platforms") {
                                if ("platforms" in next) delete next.platforms;
                                else next.platforms = [];
                              } else if (opt.id === "statuses") {
                                if ("statuses" in next) delete next.statuses;
                                else next.statuses = [];
                              } else if (opt.id === "is_completed") {
                                if ("is_completed" in next) delete next.is_completed;
                                else next.is_completed = true;
                              } else if (opt.id === "is_concept") {
                                if ("is_concept" in next) delete next.is_concept;
                                else next.is_concept = true;
                              }
                              updateOverride(index, { target: next as ProjectCardOverride["target"] });
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

                  {/* ── Project IDs — searchable multi-select dropdown ── */}
                  {override.target.ids !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Project IDs
                      </label>
                      <Dropdown
                        id={`override-ids-${index}`}
                        options={projectsOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search projects…"
                        tag="project"
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

                  {/* ── Platforms — multi-select dropdown ── */}
                  {override.target.platforms !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Platforms
                      </label>
                      <Dropdown
                        id={`override-platforms-${index}`}
                        options={platformOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search platforms…"
                        tag="platform"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.platforms ?? []}
                        onSelect={(val) => {
                          const platforms = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, platforms },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── Statuses — multi-select dropdown ── */}
                  {override.target.statuses !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Statuses
                      </label>
                      <Dropdown
                        id={`override-statuses-${index}`}
                        options={statusOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search statuses…"
                        tag="status"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.statuses ?? []}
                        onSelect={(val) => {
                          const statuses = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, statuses },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── is_completed toggle ── */}
                  {override.target.is_completed !== undefined && (
                    <Toggle
                      label="Target completed projects"
                      checked={override.target.is_completed}
                      onChange={(v) =>
                        updateOverride(index, { target: { ...override.target, is_completed: v } })
                      }
                    />
                  )}

                  {/* ── is_concept toggle ── */}
                  {override.target.is_concept !== undefined && (
                    <Toggle
                      label="Target concept projects"
                      checked={override.target.is_concept}
                      onChange={(v) =>
                        updateOverride(index, { target: { ...override.target, is_concept: v } })
                      }
                    />
                  )}

                  {/* ── Override style ── */}
                  <SelectField
                    label="Override Style"
                    id={`override-style-${index}`}
                    value={override.style}
                    onChange={(v) => updateOverride(index, { style: v as ProjectCardStyle })}
                    options={CARD_STYLE_OPTIONS}
                  />

                  {/* ── Override display toggles ── */}
                  <div className="space-y-2">
                    <Toggle
                      label="Show image (override)"
                      checked={override.showImage ?? data.showImage}
                      onChange={(v) => updateOverride(index, { showImage: v })}
                    />
                    <Toggle
                      label="Show description (override)"
                      checked={override.showDescription ?? data.showDescription}
                      onChange={(v) => updateOverride(index, { showDescription: v })}
                    />
                    <Toggle
                      label="Show URL (override)"
                      checked={override.showUrl ?? data.showUrl}
                      onChange={(v) => updateOverride(index, { showUrl: v })}
                    />
                    <Toggle
                      label="Show dates (override)"
                      checked={override.showDates ?? data.showDates}
                      onChange={(v) => updateOverride(index, { showDates: v })}
                    />
                    <Toggle
                      label="Show status (override)"
                      checked={override.showStatus ?? data.showStatus}
                      onChange={(v) => updateOverride(index, { showStatus: v })}
                    />
                    <Toggle
                      label="Show platform (override)"
                      checked={override.showPlatform ?? data.showPlatform}
                      onChange={(v) => updateOverride(index, { showPlatform: v })}
                    />
                    <Toggle
                      label="Show category (override)"
                      checked={override.showCategory ?? data.showCategory}
                      onChange={(v) => updateOverride(index, { showCategory: v })}
                    />
                    <Toggle
                      label="Show stack (override)"
                      checked={override.showStack ?? data.showStack}
                      onChange={(v) => updateOverride(index, { showStack: v })}
                    />
                    <Toggle
                      label="Show budget (override)"
                      checked={override.showBudget ?? data.showBudget}
                      onChange={(v) => updateOverride(index, { showBudget: v })}
                    />
                    <Toggle
                      label="Show client (override)"
                      checked={override.showClient ?? data.showClient}
                      onChange={(v) => updateOverride(index, { showClient: v })}
                    />
                    <Toggle
                      label="Show contribution (override)"
                      checked={override.showContribution ?? data.showContribution}
                      onChange={(v) => updateOverride(index, { showContribution: v })}
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
