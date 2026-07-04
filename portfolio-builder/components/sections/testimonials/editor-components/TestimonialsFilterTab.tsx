// portfolio-builder/components/sections/testimonials/editor-components/TestimonialsFilterTab.tsx
"use client";

import { useEffect, useRef } from "react";
import { TestimonialsData, TestimonialsFilterConfig } from "@/portfolio-builder/types/testimonials";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Toggle from "../../bio/editor-components/Toggle";
import Link from "next/link";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { RefreshCcwDot } from "lucide-react";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";
import { PBDropdown } from "@/portfolio-builder/components/shared/ui/inputs";

interface TestimonialsFilterTabProps {
  data: TestimonialsData;
  onUpdate: (value: Partial<TestimonialsFilterConfig>) => void;
}

export default function TestimonialsFilterTab({ data, onUpdate }: TestimonialsFilterTabProps) {
  const { userTestimonials, fetchMyAuthoredTestimonials, myAuthoredTestimonialsLoading } = useTestimonialsStore();
  const { userInfo } = useUserSettings();
  const filters = data.filters ?? ({} as TestimonialsFilterConfig)

  const allTestimonials = userTestimonials;

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (userTestimonials.length > 0 || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchMyAuthoredTestimonials();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const companies = Array.from(new Set(allTestimonials.map((t) => t.author_company).filter(Boolean)));
  const relationships = Array.from(new Set(allTestimonials.map((t) => t.author_relationship).filter(Boolean)));

  const companyOptions = companies.map((c) => ({ id: c!, code: c! }));
  const relationshipOptions = relationships.map((r) => ({ id: r!, code: r! }));

  const selectedTestimonialIds = filters.ids || [];
  const selectedTestimonials = allTestimonials.filter((t) => selectedTestimonialIds.includes(t.id || ""));

  const toggleTestimonialId = (testimonialId: string) => {
    const current = filters.ids || [];
    const next = current.includes(testimonialId)
      ? current.filter((id) => id !== testimonialId)
      : [...current, testimonialId];
    onUpdate({ ids: next.length > 0 ? next : undefined });
  };

  const clearFilters = () => {
    onUpdate({
      ids: undefined,
      is_featured: undefined,
      author_company: undefined,
      author_relationship: undefined,
      min_rating: undefined,
      merge_filters: undefined,
    });
  };

  const hasActiveFilters =
    filters.ids?.length ||
    filters.is_featured !== undefined ||
    filters.author_company ||
    filters.author_relationship ||
    filters.min_rating !== undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
          <h2 className="text-sm font-medium text-[var(--pb-text-primary)]">Filters</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${userInfo?.username}/testimonials`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)] hover:text-[var(--pb-text-primary)] transition-all duration-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Testimonials
          </Link>
          <button onClick={() => fetchMyAuthoredTestimonials()} disabled={myAuthoredTestimonialsLoading}
            className="inline-flex items-center justify-center p-1.5 rounded-md border border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)] hover:text-[var(--pb-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Refresh testimonials" title="Refresh testimonials list">
            <RefreshCcwDot size={16} className={myAuthoredTestimonialsLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className={`${sectionClass} bg-[var(--pb-info-bg)] p-2 rounded border-[var(--pb-info-border)]`}>
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-[var(--pb-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-[var(--pb-text-secondary)] leading-relaxed">
            Choose how to filter your testimonials. Combine property filters with hand-picked testimonials for precise control.
          </p>
        </div>
      </div>

      <div className={sectionClass}>
        <Toggle label="Match all filters (AND)" description="When ON, testimonials must match ALL active filters. When OFF, testimonials matching ANY filter are shown."
          checked={filters.merge_filters ?? true} onChange={(v) => onUpdate({ merge_filters: v })} />
      </div>

      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
          <h3 className={sectionTitleClass}>Property Filters</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PBDropdown id="filter-company" label="Company" value={filters.author_company || ""}
              onSelect={(val) => onUpdate({ author_company: val as string || undefined })}
              options={companyOptions} placeholder="All companies" clearable />
            <PBDropdown id="filter-relationship" label="Relationship" value={filters.author_relationship || ""}
              onSelect={(val) => onUpdate({ author_relationship: val as string || undefined })}
              options={relationshipOptions} placeholder="All relationships" clearable />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PBDropdown id="filter-rating" label="Minimum Rating" value={filters.min_rating?.toString() || ""}
              onSelect={(val) => onUpdate({ min_rating: val ? Number(val) : undefined })}
              options={[
                { id: "5", code: "5 Stars" },
                { id: "4", code: "4+ Stars" },
                { id: "3", code: "3+ Stars" },
                { id: "2", code: "2+ Stars" },
                { id: "1", code: "1+ Stars" },
              ]} placeholder="Any rating" clearable />
            <div className="flex flex-col gap-3">
              <Toggle label="Only featured testimonials" checked={filters.is_featured ?? false}
                onChange={(v) => onUpdate({ is_featured: v || undefined })} />
            </div>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
            <h3 className={sectionTitleClass}>Hand-picked Testimonials</h3>
          </div>
          {selectedTestimonials.length > 0 && (
            <button type="button" onClick={() => onUpdate({ ids: undefined })}
              className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors">Clear selection</button>
          )}
        </div>
        <p className="text-xs text-[var(--pb-text-muted)] mb-4">
          Select specific testimonials to display. When combined with property filters, the merge mode determines how they work together.
        </p>

        {myAuthoredTestimonialsLoading && allTestimonials.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--pb-foreground-20)] border-t-[var(--pb-foreground)]" />
            <span className="text-sm text-[var(--pb-text-muted)]">Loading testimonials...</span>
          </div>
        ) : allTestimonials.length === 0 ? (
          <div className="p-4 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            <p className="text-sm text-[var(--pb-text-muted)] text-center">No testimonials found. Add testimonials to your profile to filter them.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {allTestimonials.map((testimonial) => {
                const isSelected = selectedTestimonialIds.includes(testimonial.id || "");
                return (
                  <button key={testimonial.id} type="button" onClick={() => toggleTestimonialId(testimonial.id || "")}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 border ${isSelected
                        ? "border-[var(--pb-foreground-30)] bg-[var(--pb-foreground-10)] shadow-sm"
                        : "border-[var(--pb-border)] bg-[var(--pb-surface)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)]"
                      }`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all duration-200 ${isSelected
                        ? "bg-[var(--pb-foreground)] border-[var(--pb-foreground)] scale-100"
                        : "border-[var(--pb-border)] bg-[var(--pb-background-5)] group-hover:border-[var(--pb-border-hover)]"
                      }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-[var(--pb-background)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium transition-colors ${isSelected ? "text-[var(--pb-text-primary)]" : "text-[var(--pb-text-secondary)] group-hover:text-[var(--pb-text-primary)]"
                        }`}>{testimonial.author_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {testimonial.author_company && (
                          <span className="text-[10px] text-[var(--pb-text-muted)] truncate">{testimonial.author_company}</span>
                        )}
                        {testimonial.author_relationship && (
                          <>
                            <span className="text-[10px] text-[var(--pb-foreground-20)]">•</span>
                            <span className="text-[10px] text-[var(--pb-text-muted)]">{testimonial.author_relationship}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedTestimonials.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--pb-border)]">
                <div className="flex -space-x-1">
                  {selectedTestimonials.slice(0, 3).map((t) => (
                    <div key={t.id} className="w-5 h-5 rounded-full bg-[var(--pb-foreground-20)] border border-[var(--pb-background)] flex items-center justify-center" title={t.author_name}>
                      <span className="text-[8px] font-medium text-[var(--pb-text-primary)]">{t.author_name.charAt(0)}</span>
                    </div>
                  ))}
                  {selectedTestimonials.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-[var(--pb-surface-elevated)] border border-[var(--pb-background)] flex items-center justify-center">
                      <span className="text-[8px] text-[var(--pb-text-muted)]">+{selectedTestimonials.length - 3}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--pb-text-muted)]">{selectedTestimonials.length} testimonial{selectedTestimonials.length !== 1 ? "s" : ""} selected</p>
              </div>
            )}
          </>
        )}
      </div>

      {hasActiveFilters && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[var(--pb-success)]" />
              <h3 className={sectionTitleClass}>Active Filters</h3>
            </div>
            <button type="button" onClick={clearFilters}
              className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors flex items-center gap-1">
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
            {filters.author_company && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                Company: {filters.author_company}
                <button onClick={() => onUpdate({ author_company: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100" aria-label={`Remove ${filters.author_company} filter`}>✕</button>
              </span>
            )}
            {filters.author_relationship && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                Relationship: {filters.author_relationship}
                <button onClick={() => onUpdate({ author_relationship: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100" aria-label={`Remove ${filters.author_relationship} filter`}>✕</button>
              </span>
            )}
            {filters.min_rating !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                {filters.min_rating}+ Stars
                <button onClick={() => onUpdate({ min_rating: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100" aria-label="Remove rating filter">✕</button>
              </span>
            )}
            {filters.is_featured !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                {filters.is_featured ? "Featured" : "Not Featured"}
                <button onClick={() => onUpdate({ is_featured: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100" aria-label="Remove featured filter">✕</button>
              </span>
            )}
            {selectedTestimonialIds.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">
                {selectedTestimonialIds.length} hand-picked testimonial{selectedTestimonialIds.length !== 1 ? "s" : ""}
                <button onClick={() => onUpdate({ ids: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100" aria-label="Remove hand-picked testimonials filter">✕</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
