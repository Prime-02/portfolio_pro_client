"use client";

// PreviewSection.tsx
// Shows preview of what will be imported before actual import

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Skeleton,
  Checkbox,
  Separator,
} from "./ui-components";
import { PreviewSectionProps } from "./types";

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  previewData,
  isPreviewing,
  previewError,
  onImportAll,
  onImportSelected,
  selectedRepos,
  onSelectRepo,
  installationId
}) => {
  if (isPreviewing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previewing import...</CardTitle>
          <CardDescription>Analyzing your repositories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (previewError) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm">{previewError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!previewData) return null;

  const { counts, new_projects, existing_projects } = previewData;
  const hasNewProjects = new_projects.length > 0;
  const hasExistingProjects = existing_projects.length > 0;

  const selectedNewProjects = new_projects.filter((p) => selectedRepos.has(p.name));
  const canImportSelected = selectedNewProjects.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Import Preview</CardTitle>
            <CardDescription>
              {counts.total} repositories found for @{previewData.github_username}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">{counts.new} new</Badge>
            {counts.existing > 0 && (
              <Badge variant="secondary">{counts.existing} existing</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Projects */}
        {hasNewProjects && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-league-600 text-sm text-[var(--foreground)]">
                New Projects ({new_projects.length})
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onImportSelected(new_projects.map((p) => p.name))}
                  disabled={!canImportSelected}
                >
                  Import Selected
                </Button>
                <Button variant="default" size="sm" onClick={() => onImportAll(installationId)}>
                  Import All New
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {new_projects.map((project) => (
                <div
                  key={project.name}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 transition-colors"
                >
                  <Checkbox
                    checked={selectedRepos.has(project.name)}
                    onChange={(e) => onSelectRepo(project.name, e.target.checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[var(--foreground)] truncate">
                        {project.name}
                      </span>
                      {project.language && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {project.language}
                        </Badge>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-xs text-[var(--foreground)]/60 truncate mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[var(--foreground)]/40 shrink-0">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs">{project.stars}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Projects */}
        {hasExistingProjects && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-league-600 text-sm text-[var(--foreground)]/60">
                Already Imported ({existing_projects.length})
              </h4>
              <div className="space-y-2 opacity-60">
                {existing_projects.map((project) => (
                  <div
                    key={project.name}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--foreground)]/10 bg-[var(--foreground)]/5"
                  >
                    <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-[var(--foreground)] truncate">
                          {project.name}
                        </span>
                        {project.existing_name && (
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {project.existing_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!hasNewProjects && !hasExistingProjects && (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--foreground)]/60">
              No repositories found to import.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
