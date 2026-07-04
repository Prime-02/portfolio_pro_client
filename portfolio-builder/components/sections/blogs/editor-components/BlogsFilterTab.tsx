// portfolio-builder/components/sections/blogs/editor-components/BlogsFilterTab.tsx

"use client";

import { useEffect, useRef } from "react";
import { BlogsData, BlogsFilterConfig } from "@/portfolio-builder/types/blogs";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Toggle from "../../bio/editor-components/Toggle";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import Link from "next/link";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { RefreshCcwDot } from "lucide-react";
import type { ContentType, ContentStatus } from "@/lib/stores/contents/types/content.types";

interface BlogsFilterTabProps {
  data: BlogsData;
  onUpdate: (value: Partial<BlogsFilterConfig>) => void;
}

const CONTENT_TYPE_OPTIONS: { id: ContentType; code: string }[] = [
  { id: "POST", code: "Post" },
  { id: "BLOG", code: "Blog" },
  { id: "ARTICLE", code: "Article" },
  { id: "POLL", code: "Poll" },
];

const STATUS_OPTIONS: { id: ContentStatus; code: string }[] = [
  { id: "DRAFT", code: "Draft" },
  { id: "PUBLISHED", code: "Published" },
  { id: "ARCHIVED", code: "Archived" },
  { id: "SCHEDULED", code: "Scheduled" },
  { id: "DELETED", code: "Deleted" },
];

export default function BlogsFilterTab({ data, onUpdate }: BlogsFilterTabProps) {
  const { publicItems, fetchPublicContent, isLoading } = useContentStore();
  const { userInfo } = useUserSettings();
  const filters = data.filters ?? ({} as BlogsFilterConfig)

  const allBlogs = publicItems;

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (publicItems.length > 0 || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchPublicContent({ username: userInfo?.username || "", page_size: 50 });
  }, []);

  const categories = Array.from(new Set(allBlogs.map((b) => b.category).filter(Boolean)));
  const tags = Array.from(new Set(allBlogs.flatMap((b) => b.tags || []).filter(Boolean)));

  const categoryOptions = categories.map((c) => ({ id: c!, code: c! }));
  const tagOptions = tags.map((t) => ({ id: t!, code: t! }));

  const selectedBlogIds = filters.ids || [];
  const selectedBlogs = allBlogs.filter((b) => selectedBlogIds.includes(b.id || ""));

  const toggleBlogId = (blogId: string) => {
    const current = filters.ids || [];
    const next = current.includes(blogId)
      ? current.filter((id) => id !== blogId)
      : [...current, blogId];
    onUpdate({ ids: next.length > 0 ? next : undefined });
  };

  const clearFilters = () => {
    onUpdate({
      ids: undefined,
      content_type: undefined,
      status: undefined,
      category: undefined,
      tags: undefined,
      is_public: undefined,
      is_featured: undefined,
      search: undefined,
      date_from: undefined,
      date_to: undefined,
      merge_filters: undefined,
    });
  };

  const hasActiveFilters =
    filters.ids?.length ||
    filters.content_type ||
    filters.status ||
    filters.category ||
    filters.tags?.length ||
    filters.is_public !== undefined ||
    filters.is_featured !== undefined ||
    filters.search ||
    filters.date_from ||
    filters.date_to;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Actions */}
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
          <h2 className="text-sm font-medium text-[var(--pb-text-primary)]">Filters</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${userInfo?.username}/content`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)] hover:text-[var(--pb-text-primary)] transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Content
          </Link>
          <button
            onClick={() => fetchPublicContent({ username: userInfo?.username || "", page_size: 50 })}
            disabled={isLoading}
            className="inline-flex items-center justify-center p-1.5 rounded-md border border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)] hover:text-[var(--pb-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Refresh blogs"
          >
            <RefreshCcwDot size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filter Mode Explanation */}
      <div className={`${sectionClass} bg-[var(--pb-info-bg)] p-2 rounded border-[var(--pb-info-border)]`}>
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-[var(--pb-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-[var(--pb-text-secondary)] leading-relaxed">
            Choose how to filter your content. Combine property filters with hand-picked content for precise control.
          </p>
        </div>
      </div>

      {/* Merge Mode */}
      <div className={sectionClass}>
        <Toggle
          label="Match all filters (AND)"
          description="When ON, content must match ALL active filters. When OFF, content matching ANY filter is shown."
          checked={filters.merge_filters ?? true}
          onChange={(v) => onUpdate({ merge_filters: v })}
        />
      </div>

      {/* Property Filters */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
          <h3 className={sectionTitleClass}>Property Filters</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              id="filter-content-type"
              label="Content Type"
              value={filters.content_type || ""}
              onSelect={(val) => onUpdate({ content_type: (val as ContentType) || undefined })}
              options={CONTENT_TYPE_OPTIONS}
              placeholder="All types"
              clearable
            />
            <Dropdown
              id="filter-status"
              label="Status"
              value={filters.status || ""}
              onSelect={(val) => onUpdate({ status: (val as ContentStatus) || undefined })}
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              clearable
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              id="filter-category"
              label="Category"
              value={filters.category || ""}
              onSelect={(val) => onUpdate({ category: (val as string) || undefined })}
              options={categoryOptions}
              placeholder="All categories"
              clearable
            />
            <Dropdown
              id="filter-tags"
              label="Tags"
              value={filters.tags?.[0] || ""}
              onSelect={(val) => onUpdate({ tags: val ? [val as string] : undefined })}
              options={tagOptions}
              placeholder="All tags"
              clearable
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Toggle
                label="Only featured content"
                checked={filters.is_featured ?? false}
                onChange={(v) => onUpdate({ is_featured: v || undefined })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hand-picked Blogs */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[var(--pb-foreground-20)]" />
            <h3 className={sectionTitleClass}>Hand-picked Content</h3>
          </div>
          {selectedBlogs.length > 0 && (
            <button type="button" onClick={() => onUpdate({ ids: undefined })} className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors">Clear selection</button>
          )}
        </div>
        <p className="text-xs text-[var(--pb-text-muted)] mb-4">
          Select specific content to display. When combined with property filters, the merge mode determines how they work together.
        </p>
        {isLoading && allBlogs.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--pb-foreground-20)] border-t-[var(--pb-foreground)]" />
            <span className="text-sm text-[var(--pb-text-muted)]">Loading content...</span>
          </div>
        ) : allBlogs.length === 0 ? (
          <div className="p-4 rounded-lg bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            <p className="text-sm text-[var(--pb-text-muted)] text-center">No content found. Add content to your profile to filter it.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {allBlogs.map((blog) => {
                const isSelected = selectedBlogIds.includes(blog.id || "");
                return (
                  <button
                    key={blog.id}
                    type="button"
                    onClick={() => toggleBlogId(blog.id || "")}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 border ${isSelected ? "border-[var(--pb-foreground-30)] bg-[var(--pb-foreground-10)] shadow-sm" : "border-[var(--pb-border)] bg-[var(--pb-surface)] hover:bg-[var(--pb-surface-hover)] hover:border-[var(--pb-border-hover)]"}`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all duration-200 ${isSelected ? "bg-[var(--pb-foreground)] border-[var(--pb-foreground)] scale-100" : "border-[var(--pb-border)] bg-[var(--pb-background-5)] group-hover:border-[var(--pb-border-hover)]"}`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-[var(--pb-background)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium transition-colors ${isSelected ? "text-[var(--pb-text-primary)]" : "text-[var(--pb-text-secondary)] group-hover:text-[var(--pb-text-primary)]"}`}>{blog.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {blog.content_type && <span className="text-[10px] text-[var(--pb-text-muted)] truncate">{blog.content_type}</span>}
                        {blog.category && (
                          <>
                            <span className="text-[10px] text-[var(--pb-foreground-20)]">•</span>
                            <span className="text-[10px] text-[var(--pb-text-muted)] capitalize">{blog.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedBlogs.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--pb-border)]">
                <div className="flex -space-x-1">
                  {selectedBlogs.slice(0, 3).map((blog) => (
                    <div key={blog.id} className="w-5 h-5 rounded-full bg-[var(--pb-foreground-20)] border border-[var(--pb-background)] flex items-center justify-center" title={blog.title}>
                      <span className="text-[8px] font-medium text-[var(--pb-text-primary)]">{blog.title.charAt(0)}</span>
                    </div>
                  ))}
                  {selectedBlogs.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-[var(--pb-surface-elevated)] border border-[var(--pb-background)] flex items-center justify-center">
                      <span className="text-[8px] text-[var(--pb-text-muted)]">+{selectedBlogs.length - 3}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--pb-text-muted)]">{selectedBlogs.length} item{selectedBlogs.length !== 1 ? "s" : ""} selected</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[var(--pb-success)]" />
              <h3 className={sectionTitleClass}>Active Filters</h3>
            </div>
            <button type="button" onClick={clearFilters} className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear all filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.merge_filters !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                {filters.merge_filters ? "AND" : "OR"} mode
              </span>
            )}
            {filters.content_type && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">Type: {filters.content_type}<button onClick={() => onUpdate({ content_type: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100">✕</button></span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] capitalize group">Status: {filters.status}<button onClick={() => onUpdate({ status: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100">✕</button></span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">Category: {filters.category}<button onClick={() => onUpdate({ category: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100">✕</button></span>
            )}
            {filters.tags && filters.tags.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">Tag: {filters.tags[0]}<button onClick={() => onUpdate({ tags: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100">✕</button></span>
            )}
            {filters.is_public !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">{filters.is_public ? "Public" : "Private"}<button onClick={() => onUpdate({ is_public: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100">✕</button></span>
            )}
            {filters.is_featured !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">{filters.is_featured ? "Featured" : "Not Featured"}<button onClick={() => onUpdate({ is_featured: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100">✕</button></span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">Search: {filters.search}<button onClick={() => onUpdate({ search: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100">✕</button></span>
            )}
            {selectedBlogIds.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-xs text-[var(--pb-text-secondary)] group">{selectedBlogIds.length} hand-picked item{selectedBlogIds.length !== 1 ? "s" : ""}<button onClick={() => onUpdate({ ids: undefined })} className="hover:text-[var(--pb-error)] transition-colors opacity-50 hover:opacity-100">✕</button></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
