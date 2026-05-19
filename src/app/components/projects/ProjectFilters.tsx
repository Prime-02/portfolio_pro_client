"use client";

import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Dropdown from "../inputs/DynamicDropdown";

interface ProjectFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  filterPlatform: string;
  onPlatformChange: (platform: string) => void;
  sort: "name" | "date";
  onSortChange: (sort: "name" | "date") => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (dir: "asc" | "desc") => void;
}

const SORT_OPTIONS = [
  { id: "date", code: "Date" },
  { id: "name", code: "Name" },
];

export function ProjectFilters({
  query,
  onQueryChange,
  filterPlatform,
  onPlatformChange,
  sort,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/30" />
        <input
          type="text"
          placeholder="Search projects..."
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
          options={SORT_OPTIONS}
          value={sort}
          onSelect={(v) => onSortChange(v as "name" | "date")}
          className="w-32"
        />
        <button
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
