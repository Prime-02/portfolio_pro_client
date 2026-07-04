// portfolio-builder/components/sections/skills/editor-components/SkillsFilterTab.tsx

"use client";

import { useEffect, useRef } from "react";
import { SkillsData, SkillsFilterConfig } from "@/portfolio-builder/types/skills";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Toggle from "../../bio/editor-components/Toggle";
import { ProfessionalSkill, useSkills } from "@/lib/stores/skills/useSkills";
import Link from "next/link";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { RefreshCcwDot } from "lucide-react";

interface SkillsFilterTabProps {
  data: SkillsData;
  onUpdate: (value: Partial<SkillsFilterConfig>) => void;
}

export default function SkillsFilterTab({ data, onUpdate }: SkillsFilterTabProps) {
  const { skills, fetchAllSkills, isLoading } = useSkills();
  const { userInfo } = useUserSettings()
  const filters = data.filters ?? ({} as SkillsFilterConfig);

  // `skills` is the authenticated user's own unfiltered list — the correct
  // source for the editor. `fetchPublicSkillsByUsername` is intentionally not
  // used here so public filter params never pollute the editor dropdowns.
  const allSkills: ProfessionalSkill[] = skills;

  // Fetch only on first mount and only when the store is empty.
  // The ref guards against duplicate calls fired during auto-save re-renders.
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (skills.length > 0 || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchAllSkills();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract unique values for dropdowns
  const categories = Array.from(new Set(allSkills.map((s) => s.category).filter(Boolean)));
  const subcategories = Array.from(new Set(allSkills.map((s) => s.subcategory).filter(Boolean)));
  const difficultyLevels = Array.from(new Set(allSkills.map((s) => s.difficulty_level).filter(Boolean)));

  const categoryOptions = categories.map((c) => ({ id: c!, code: c! }));
  const subcategoryOptions = subcategories.map((s) => ({ id: s!, code: s! }));
  const difficultyOptions = difficultyLevels.map((d) => ({ id: d!, code: d! }));

  // Selected skills display
  const selectedSkillIds = filters.ids || [];
  const selectedSkills = allSkills.filter((s) => selectedSkillIds.includes(s.id || ""));

  const toggleSkillId = (skillId: string) => {
    const current = filters.ids || [];
    const next = current.includes(skillId)
      ? current.filter((id) => id !== skillId)
      : [...current, skillId];
    onUpdate({ ids: next.length > 0 ? next : undefined });
  };

  const clearFilters = () => {
    onUpdate({
      ids: undefined,
      category: undefined,
      subcategory: undefined,
      difficulty_level: undefined,
      is_major: undefined,
      merge_filters: undefined,
    });
  };

  const hasActiveFilters =
    filters.ids?.length ||
    filters.category ||
    filters.subcategory ||
    filters.difficulty_level ||
    filters.is_major !== undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header Actions ── */}
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
          <h2 className="text-sm font-medium text-[var(--pb-text-primary)]">
            Filters
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${userInfo?.username}/skills`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)] hover:text-[var(--pb-text-primary)] transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Skills
          </Link>

          <button
            onClick={() => fetchAllSkills()}
            disabled={isLoading}
            className="inline-flex items-center justify-center p-1.5 rounded-md border border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)] hover:text-[var(--pb-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Refresh skills"
            title="Refresh skills list"
          >
            <RefreshCcwDot size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Filter Mode Explanation ── */}
      <div className={`${sectionClass} bg-[var(--pb-info-bg)] p-2 rounded border-[var(--pb-info-border)]`}>
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-[var(--pb-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-[var(--pb-text-secondary)] leading-relaxed">
            Choose how to filter your skills. Combine property filters with hand-picked skills for precise control.
          </p>
        </div>
      </div>

      {/* ── Merge Mode ── */}
      <div className={sectionClass}>
        <Toggle
          label="Match all filters (AND)"
          description="When ON, skills must match ALL active filters. When OFF, skills matching ANY filter are shown."
          checked={filters.merge_filters ?? true}
          onChange={(v) => onUpdate({ merge_filters: v })}
        />
      </div>

      {/* ── Property Filters ── */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
          <h3 className={sectionTitleClass}>Property Filters</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              id="filter-category"
              label="Category"
              value={filters.category || ""}
              onSelect={(val) => onUpdate({ category: val as string || undefined })}
              options={categoryOptions}
              placeholder="All categories"
              clearable
            />
            <Dropdown
              id="filter-subcategory"
              label="Subcategory"
              value={filters.subcategory || ""}
              onSelect={(val) => onUpdate({ subcategory: val as string || undefined })}
              options={subcategoryOptions}
              placeholder="All subcategories"
              clearable
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              id="filter-difficulty"
              label="Difficulty Level"
              value={filters.difficulty_level || ""}
              onSelect={(val) => onUpdate({ difficulty_level: val as string || undefined })}
              options={difficultyOptions}
              placeholder="All difficulty levels"
              clearable
            />
            <div className="flex items-end">
              <Toggle
                label="Only major skills"
                description="Show skills marked as major"
                checked={filters.is_major ?? false}
                onChange={(v) => onUpdate({ is_major: v || undefined })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Hand-picked Skills ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
            <h3 className={sectionTitleClass}>Hand-picked Skills</h3>
          </div>

          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={() => onUpdate({ ids: undefined })}
              className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>

        <p className="text-xs text-[var(--pb-text-muted)] mb-4">
          Select specific skills to display. When combined with property filters, the merge mode determines how they work together.
        </p>

        {isLoading && allSkills.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--pb-foreground-20)] border-t-[var(--pb-foreground)]" />
            <span className="text-sm text-[var(--pb-text-muted)]">Loading skills...</span>
          </div>
        ) : allSkills.length === 0 ? (
          <div className="p-4 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            <p className="text-sm text-[var(--pb-text-muted)] text-center">
              No skills found. Add skills to your profile to filter them.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {allSkills.map((skill) => {
                const isSelected = selectedSkillIds.includes(skill.id || "");
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkillId(skill.id || "")}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 border ${isSelected
                        ? "border-[var(--pb-foreground-30)] bg-[var(--pb-foreground-10)] shadow-sm"
                        : "border-[var(--pb-border)] bg-[var(--pb-surface)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)]"
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all duration-200 ${isSelected
                          ? "bg-[var(--pb-foreground)] border-[var(--pb-foreground)] scale-100"
                          : "border-[var(--pb-border)] bg-[var(--pb-background-5)] group-hover:border-[var(--pb-border-hover)]"
                        }`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-[var(--pb-background)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium transition-colors ${isSelected ? "text-[var(--pb-text-primary)]" : "text-[var(--pb-text-secondary)] group-hover:text-[var(--pb-text-primary)]"
                        }`}>
                        {skill.skill_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {skill.category && (
                          <span className="text-[10px] text-[var(--pb-text-muted)] truncate">
                            {skill.category}
                          </span>
                        )}
                        {skill.difficulty_level && (
                          <>
                            <span className="text-[10px] text-[var(--pb-foreground-20)]">•</span>
                            <span className="text-[10px] text-[var(--pb-text-muted)] capitalize">
                              {skill.difficulty_level}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedSkills.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--pb-border)]">
                <div className="flex -space-x-1">
                  {selectedSkills.slice(0, 3).map((skill) => (
                    <div
                      key={skill.id}
                      className="w-5 h-5 rounded-full bg-[var(--pb-foreground-20)] border border-[var(--pb-background)] flex items-center justify-center"
                      title={skill.skill_name}
                    >
                      <span className="text-[8px] font-medium text-[var(--pb-text-primary)]">
                        {skill.skill_name.charAt(0)}
                      </span>
                    </div>
                  ))}
                  {selectedSkills.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-[var(--pb-surface-elevated)] border border-[var(--pb-background)] flex items-center justify-center">
                      <span className="text-[8px] text-[var(--pb-text-muted)]">
                        +{selectedSkills.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--pb-text-muted)]">
                  {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Active Filter Summary ── */}
      {hasActiveFilters && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[var(--pb-success)]" />
              <h3 className={sectionTitleClass}>Active Filters</h3>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear all filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.merge_filters !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {filters.merge_filters ? "AND" : "OR"} mode
              </span>
            )}

            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                Category: {filters.category}
                <button
                  onClick={() => onUpdate({ category: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label={`Remove ${filters.category} filter`}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.subcategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                Subcategory: {filters.subcategory}
                <button
                  onClick={() => onUpdate({ subcategory: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label={`Remove ${filters.subcategory} filter`}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.difficulty_level && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] capitalize group">
                Difficulty: {filters.difficulty_level}
                <button
                  onClick={() => onUpdate({ difficulty_level: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label={`Remove ${filters.difficulty_level} filter`}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.is_major && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                Major skills only
                <button
                  onClick={() => onUpdate({ is_major: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label="Remove major skills filter"
                >
                  ✕
                </button>
              </span>
            )}

            {selectedSkillIds.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                {selectedSkillIds.length} hand-picked skill{selectedSkillIds.length !== 1 ? "s" : ""}
                <button
                  onClick={() => onUpdate({ ids: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label="Remove hand-picked skills filter"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}