"use client";

import { Search, ArrowUpDown, Filter } from "lucide-react";
import Dropdown from "../inputs/DynamicDropdown";

interface BlogFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  status: "" | "PUBLISHED" | "DRAFT" | "ARCHIVED";
  onStatusChange: (status: "" | "PUBLISHED" | "DRAFT" | "ARCHIVED") => void;
  sort: "date" | "name" | "views" | "likes";
  onSortChange: (sort: "date" | "name" | "views" | "likes") => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (dir: "asc" | "desc") => void;
}

const SORT_OPTIONS = [
  { id: "date", code: "Date" },
  { id: "name", code: "Title" },
  { id: "views", code: "Views" },
  { id: "likes", code: "Likes" },
];

const STATUS_OPTIONS = [
  { id: "", code: "All Status" },
  { id: "PUBLISHED", code: "Published" },
  { id: "DRAFT", code: "Draft" },
  { id: "ARCHIVED", code: "Archived" },
];

export function BlogFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
}: BlogFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/30" />
        <input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--foreground)]/10 
                     bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent)]/50
                     placeholder:text-[var(--foreground)]/30"
        />
      </div>

      <div className="flex gap-2">
        <Dropdown
          type="dropdown"
          options={STATUS_OPTIONS}
          value={status}
          onSelect={(v) => onStatusChange(v as "" | "PUBLISHED" | "DRAFT" | "ARCHIVED")}
          className="w-36"
        />
        <Dropdown
          type="dropdown"
          options={SORT_OPTIONS}
          value={sort}
          onSelect={(v) => onSortChange(v as "date" | "name" | "views" | "likes")}
          className="w-32"
        />
        <button
          title="Sort By Icon"
          onClick={() => onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")}
          className="px-3 py-2.5 rounded-xl border border-[var(--foreground)]/10 
                     hover:border-[var(--accent)]/30 transition-colors"
        >
          <ArrowUpDown className={`w-4 h-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );
}
