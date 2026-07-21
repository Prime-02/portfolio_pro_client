"use client";

// RepositoryList.tsx
// Grid/list of repository cards with selection state management

import React from "react";
import { RepositoryCard } from "./RepositoryCard";
import { Checkbox, Separator } from "./ui-components";
import { RepositoryListProps } from "./types";

export const RepositoryList: React.FC<RepositoryListProps> = ({
  repositories,
  selectedRepos,
  importingRepos,
  importResults,
  onSelectRepo,
  onImportSingle,
  onSelectAll,
}) => {
  const allSelected = repositories.length > 0 && repositories.every((r) => selectedRepos.has(r.name));

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  return (
    <div className="space-y-3">
      {/* Select All Header */}
      <div className="flex items-center gap-3 px-1 py-2">
        <Checkbox
          checked={allSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
          label={allSelected ? "Deselect all" : "Select all"}
        />
        <Separator className="flex-1" />
        <span className="text-xs text-[var(--foreground)]/40">
          {selectedRepos.size} of {repositories.length} selected
        </span>
      </div>

      {/* Repository Cards */}
      <div className="grid gap-3">
        {repositories.map((repo) => (
          <RepositoryCard
            key={repo.name}
            repo={repo}
            isSelected={selectedRepos.has(repo.name)}
            isImporting={importingRepos.has(repo.name)}
            importStatus={
              importResults[repo.name]
                ? importResults[repo.name].success
                  ? "success"
                  : "error"
                : "idle"
            }
            onSelect={onSelectRepo}
            onImportSingle={onImportSingle}
          />
        ))}
      </div>
    </div>
  );
};
