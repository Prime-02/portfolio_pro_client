// portfolio-builder/components/sections/projects/editor-components/ProjectsFilterTab.tsx

"use client";

import { useEffect, useRef } from "react";
import { ProjectsData, ProjectsFilterConfig } from "@/portfolio-builder/types/projects";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Toggle from "../../bio/editor-components/Toggle";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import Link from "next/link";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { RefreshCcwDot } from "lucide-react";

interface ProjectsFilterTabProps {
  data: ProjectsData;
  onUpdate: (value: Partial<ProjectsFilterConfig>) => void;
}

export default function ProjectsFilterTab({ data, onUpdate }: ProjectsFilterTabProps) {
  const { projects, fetchMyProjects, loading } = useProjectStore();
  const { userInfo } = useUserSettings();
  const filters = data.filters;

  // `projects` is the authenticated user's own unfiltered list
  const allProjects = projects;

  // Fetch only on first mount and only when the store is empty.
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (projects.length > 0 || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchMyProjects({ include_public: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract unique values for dropdowns
  const categories = Array.from(new Set(allProjects.map((p) => p.project_category).filter(Boolean)));
  const platforms = Array.from(new Set(allProjects.map((p) => p.project_platform).filter(Boolean)));
  const statuses = Array.from(new Set(allProjects.map((p) => p.status).filter(Boolean)));

  const categoryOptions = categories.map((c) => ({ id: c!, code: c! }));
  const platformOptions = platforms.map((p) => ({ id: p!, code: p! }));
  const statusOptions = statuses.map((s) => ({ id: s!, code: s! }));

  // Selected projects display
  const selectedProjectIds = filters.ids || [];
  const selectedProjects = allProjects.filter((p) => selectedProjectIds.includes(p.id || ""));

  const toggleProjectId = (projectId: string) => {
    const current = filters.ids || [];
    const next = current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId];
    onUpdate({ ids: next.length > 0 ? next : undefined });
  };

  const clearFilters = () => {
    onUpdate({
      ids: undefined,
      is_completed: undefined,
      is_concept: undefined,
      project_category: undefined,
      project_platform: undefined,
      project_status: undefined,
      merge_filters: undefined,
    });
  };

  const hasActiveFilters =
    filters.ids?.length ||
    filters.is_completed !== undefined ||
    filters.is_concept !== undefined ||
    filters.project_category ||
    filters.project_platform ||
    filters.project_status;

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
            href={`/${userInfo?.username}/projects`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)] hover:text-[var(--pb-text-primary)] transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Projects
          </Link>

          <button
            onClick={() => fetchMyProjects({ include_public: true })}
            disabled={loading.fetchProjects}
            className="inline-flex items-center justify-center p-1.5 rounded-md border border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)] hover:text-[var(--pb-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Refresh projects"
            title="Refresh projects list"
          >
            <RefreshCcwDot size={16} className={loading.fetchProjects ? "animate-spin" : ""} />
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
            Choose how to filter your projects. Combine property filters with hand-picked projects for precise control.
          </p>
        </div>
      </div>

      {/* ── Merge Mode ── */}
      <div className={sectionClass}>
        <Toggle
          label="Match all filters (AND)"
          description="When ON, projects must match ALL active filters. When OFF, projects matching ANY filter are shown."
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
              value={filters.project_category || ""}
              onSelect={(val) => onUpdate({ project_category: val as string || undefined })}
              options={categoryOptions}
              placeholder="All categories"
              clearable
            />
            <Dropdown
              id="filter-platform"
              label="Platform"
              value={filters.project_platform || ""}
              onSelect={(val) => onUpdate({ project_platform: val as string || undefined })}
              options={platformOptions}
              placeholder="All platforms"
              clearable
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              id="filter-status"
              label="Status"
              value={filters.project_status || ""}
              onSelect={(val) => onUpdate({ project_status: val as string || undefined })}
              options={statusOptions}
              placeholder="All statuses"
              clearable
            />
            <div className="flex flex-col gap-3">
              <Toggle
                label="Only completed projects"
                checked={filters.is_completed ?? false}
                onChange={(v) => onUpdate({ is_completed: v || undefined })}
              />
              <Toggle
                label="Only concept projects"
                checked={filters.is_concept ?? false}
                onChange={(v) => onUpdate({ is_concept: v || undefined })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Hand-picked Projects ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
            <h3 className={sectionTitleClass}>Hand-picked Projects</h3>
          </div>

          {selectedProjects.length > 0 && (
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
          Select specific projects to display. When combined with property filters, the merge mode determines how they work together.
        </p>

        {loading.fetchProjects && allProjects.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--pb-foreground-20)] border-t-[var(--pb-foreground)]" />
            <span className="text-sm text-[var(--pb-text-muted)]">Loading projects...</span>
          </div>
        ) : allProjects.length === 0 ? (
          <div className="p-4 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            <p className="text-sm text-[var(--pb-text-muted)] text-center">
              No projects found. Add projects to your profile to filter them.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {allProjects.map((project) => {
                const isSelected = selectedProjectIds.includes(project.id || "");
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => toggleProjectId(project.id || "")}
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
                        {project.project_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {project.project_category && (
                          <span className="text-[10px] text-[var(--pb-text-muted)] truncate">
                            {project.project_category}
                          </span>
                        )}
                        {project.project_platform && (
                          <>
                            <span className="text-[10px] text-[var(--pb-foreground-20)]">•</span>
                            <span className="text-[10px] text-[var(--pb-text-muted)] capitalize">
                              {project.project_platform}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedProjects.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--pb-border)]">
                <div className="flex -space-x-1">
                  {selectedProjects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="w-5 h-5 rounded-full bg-[var(--pb-foreground-20)] border border-[var(--pb-background)] flex items-center justify-center"
                      title={project.project_name}
                    >
                      <span className="text-[8px] font-medium text-[var(--pb-text-primary)]">
                        {project.project_name.charAt(0)}
                      </span>
                    </div>
                  ))}
                  {selectedProjects.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-[var(--pb-surface-elevated)] border border-[var(--pb-background)] flex items-center justify-center">
                      <span className="text-[8px] text-[var(--pb-text-muted)]">
                        +{selectedProjects.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--pb-text-muted)]">
                  {selectedProjects.length} project{selectedProjects.length !== 1 ? "s" : ""} selected
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

            {filters.project_category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                Category: {filters.project_category}
                <button
                  onClick={() => onUpdate({ project_category: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label={`Remove ${filters.project_category} filter`}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.project_platform && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                Platform: {filters.project_platform}
                <button
                  onClick={() => onUpdate({ project_platform: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label={`Remove ${filters.project_platform} filter`}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.project_status && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] capitalize group">
                Status: {filters.project_status}
                <button
                  onClick={() => onUpdate({ project_status: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label={`Remove ${filters.project_status} filter`}
                >
                  ✕
                </button>
              </span>
            )}

            {filters.is_completed !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                {filters.is_completed ? "Completed" : "In Progress"}
                <button
                  onClick={() => onUpdate({ is_completed: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label="Remove completion filter"
                >
                  ✕
                </button>
              </span>
            )}

            {filters.is_concept !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                {filters.is_concept ? "Concept" : "Real"}
                <button
                  onClick={() => onUpdate({ is_concept: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label="Remove concept filter"
                >
                  ✕
                </button>
              </span>
            )}

            {selectedProjectIds.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                {selectedProjectIds.length} hand-picked project{selectedProjectIds.length !== 1 ? "s" : ""}
                <button
                  onClick={() => onUpdate({ ids: undefined })}
                  className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100"
                  aria-label="Remove hand-picked projects filter"
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
