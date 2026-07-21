"use client";

// ImportHeader.tsx
// Header section with action buttons for bulk import operations

import React from "react";
import { Button, Badge, Separator } from "./ui-components";
import { ImportHeaderProps } from "./types";

export const ImportHeader: React.FC<ImportHeaderProps> = ({
  totalProjects,
  selectedCount,
  isLoading,
  onImportAll,
  onImportSelected,
  onRefresh,
  isImporting,
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-league-700 text-2xl sm:text-3xl text-[var(--foreground)] tracking-tight">
            Import Vercel Projects
          </h1>
          <p className="text-sm text-[var(--foreground)]/60 mt-1">
            Import your Vercel deployments as projects. Select individual projects or import all at once.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} isLoading={isLoading} disabled={isImporting}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {totalProjects} {totalProjects === 1 ? "project" : "projects"} available
          </Badge>
          {hasSelection && (
            <Badge variant="default">{selectedCount} selected</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onImportSelected}
            disabled={!hasSelection || isImporting || isLoading}
            isLoading={isImporting && hasSelection}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Import Selected
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onImportAll}
            disabled={totalProjects === 0 || isImporting || isLoading}
            isLoading={isImporting && !hasSelection}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Import All
          </Button>
        </div>
      </div>

      <Separator />
    </div>
  );
};
