"use client";

// PreviewSection.tsx
// Shows preview of what will be imported before actual import

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Skeleton, Checkbox, Separator } from "./ui-components";
import { PreviewSectionProps } from "./types";

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  previewData,
  isPreviewing,
  previewError,
  onImportAll,
  onImportSelected,
  selectedProjects,
  onSelectProject,
}) => {
  if (isPreviewing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previewing import...</CardTitle>
          <CardDescription>Analyzing your Vercel projects</CardDescription>
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

  const selectedNewProjects = new_projects.filter((p) => selectedProjects.has(p.name || ""));
  const canImportSelected = selectedNewProjects.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Import Preview</CardTitle>
            <CardDescription>
              {counts.total} projects found
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
                  onClick={() => onImportSelected(new_projects.map((p) => p.name || ""))}
                  disabled={!canImportSelected}
                >
                  Import Selected
                </Button>
                <Button variant="default" size="sm" onClick={onImportAll}>
                  Import All New
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {new_projects.map((project) => (
                <div
                  key={project.id || project.name}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 transition-colors"
                >
                  <Checkbox
                    checked={selectedProjects.has(project.name || "")}
                    onChange={(e) => onSelectProject(project.name || "", e.target.checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[var(--foreground)] truncate">
                        {project.name}
                      </span>
                      {project.framework && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {project.framework}
                        </Badge>
                      )}
                      {project.live && (
                        <Badge variant="success" className="text-[10px] px-1.5">
                          Live
                        </Badge>
                      )}
                    </div>
                    {project.production_url && (
                      <p className="text-xs text-[var(--foreground)]/60 truncate mt-0.5">
                        {project.production_url}
                      </p>
                    )}
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
                    key={project.id || project.name}
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
              No projects found to import.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
