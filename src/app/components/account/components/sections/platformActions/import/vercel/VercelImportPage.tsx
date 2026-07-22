"use client";

// VercelImportPage.tsx
// Main page component for Vercel project import
// Route: /[username]/settings/account/vercel

import React, { useState, useCallback, useEffect } from "react";
import {
  useVercelProjects,
  useVercelPreview,
  useVercelImport,
  useVercelActiveIntegration,
  useVercelAccountManagement,
  VercelProjectInfo,
} from "@/lib/stores/linked_platforms/vercel/vercel-integration.store";

import { ImportHeader } from "./ImportHeader";
import { ProjectList } from "./ProjectList";
import { PreviewSection } from "./PreviewSection";
import { ImportStatus } from "./ImportStatus";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingSkeleton } from "./LoadingSkeleton";

export const VercelImportPage: React.FC = () => {

  // Local state
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [importingProjects, setImportingProjects] = useState<Set<string>>(new Set());
  const [singleImportResults, setSingleImportResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const [showPreview, setShowPreview] = useState(false);

  // Integration management
  const {
    activeIntegrationId,
    getActiveIntegrationId,
    setActiveIntegration,
  } = useVercelActiveIntegration();

  const {
    integrations,
    isLoadingIntegrations,
    integrationsError,
    listVercelIntegrations,
  } = useVercelAccountManagement();

  // Store hooks
  const {
    projects,
    isLoadingProjects,
    projectsError,
    projectsPagination,
    listVercelProjects,
    resetProjectsList,
  } = useVercelProjects();

  const {
    previewData,
    isPreviewing,
    previewError,
    previewVercelImport,
    resetPreviewState,
  } = useVercelPreview();

  const {
    isImporting,
    importResponse,
    importResult,
    importError,
    importVercelProjects,
    resetImportState,
  } = useVercelImport();

  // Load integrations on mount
  useEffect(() => {
    listVercelIntegrations().catch(err => {
      console.error('Failed to load integrations:', err);
    });
  }, []);

  // Fetch projects when active integration changes
  useEffect(() => {
    const currentIntegrationId = getActiveIntegrationId();
    if (currentIntegrationId) {
      fetchProjects(currentIntegrationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIntegrationId]);

  const fetchProjects = useCallback((integrationId?: string) => {
    const currentIntegrationId = integrationId || getActiveIntegrationId();

    resetProjectsList();
    resetPreviewState();
    resetImportState();
    setSelectedProjects(new Set());
    setImportingProjects(new Set());
    setSingleImportResults({});
    setShowPreview(false);

    if (currentIntegrationId) {
      listVercelProjects({
        page: 1,
        limit: 100,
        integration_id: currentIntegrationId
      });
    }
  }, [listVercelProjects, resetProjectsList, resetPreviewState, resetImportState, getActiveIntegrationId]);

  // Handle integration switch
  const handleIntegrationSwitch = useCallback((integrationId: string) => {
    setActiveIntegration(integrationId);
  }, [setActiveIntegration]);

  // Handle preview import
  const handlePreview = useCallback(async () => {
    const currentIntegrationId = getActiveIntegrationId();
    if (!currentIntegrationId) return;

    setShowPreview(true);
    resetPreviewState();

    try {
      await previewVercelImport(
        {
          import_all: true,
        },
        currentIntegrationId
      );
    } catch {
      // Error handled by store
    }
  }, [previewVercelImport, resetPreviewState, getActiveIntegrationId]);

  // Handle select/deselect a single project
  const handleSelectProject = useCallback((projectName: string, selected: boolean) => {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(projectName);
      } else {
        next.delete(projectName);
      }
      return next;
    });
  }, []);

  // Handle select all / deselect all
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedProjects(new Set(projects.map((p) => p.name)));
      } else {
        setSelectedProjects(new Set());
      }
    },
    [projects]
  );

  // Handle import single project
  const handleImportSingle = useCallback(
    async (project: VercelProjectInfo) => {
      const currentIntegrationId = getActiveIntegrationId();
      if (!currentIntegrationId) return;

      setImportingProjects((prev) => {
        const next = new Set(prev);
        next.add(project.name);
        return next;
      });

      try {
        await importVercelProjects(
          {
            import_all: false,
            project_names: [project.name],
          },
          currentIntegrationId
        );

        setSingleImportResults((prev) => ({
          ...prev,
          [project.name]: { success: true, message: "Imported successfully" },
        }));
      } catch {
        setSingleImportResults((prev) => ({
          ...prev,
          [project.name]: { success: false, message: importError || "Import failed" },
        }));
      } finally {
        setImportingProjects((prev) => {
          const next = new Set(prev);
          next.delete(project.name);
          return next;
        });
      }
    },
    [importVercelProjects, importError, getActiveIntegrationId]
  );

  // Handle import all projects
  const handleImportAll = useCallback(async () => {
    const currentIntegrationId = getActiveIntegrationId();
    if (!currentIntegrationId || projects.length === 0) return;

    setImportingProjects(new Set(projects.map((p) => p.name)));

    try {
      await importVercelProjects(
        {
          import_all: true,
        },
        currentIntegrationId
      );
    } catch {
      // Error handled by store
    } finally {
      setImportingProjects(new Set());
    }
  }, [projects, importVercelProjects, getActiveIntegrationId]);

  // Handle import selected projects
  const handleImportSelected = useCallback(async () => {
    const currentIntegrationId = getActiveIntegrationId();
    if (!currentIntegrationId || selectedProjects.size === 0) return;

    setImportingProjects(new Set(Array.from(selectedProjects)));

    try {
      await importVercelProjects(
        {
          import_all: false,
          project_names: Array.from(selectedProjects),
        },
        currentIntegrationId
      );
      setSelectedProjects(new Set());
    } catch {
      // Error handled by store
    } finally {
      setImportingProjects(new Set());
    }
  }, [selectedProjects, importVercelProjects, getActiveIntegrationId]);

  // Handle import from preview (selected new projects)
  const handleImportPreviewSelected = useCallback(
    async (projectNames: string[]) => {
      const currentIntegrationId = getActiveIntegrationId();
      if (!previewData || projectNames.length === 0 || !currentIntegrationId) return;

      setImportingProjects(new Set(projectNames));

      try {
        await importVercelProjects(
          {
            import_all: false,
            project_names: projectNames,
          },
          currentIntegrationId
        );
      } catch {
        // Error handled by store
      } finally {
        setImportingProjects(new Set());
      }
    },
    [previewData, importVercelProjects, getActiveIntegrationId]
  );

  // Handle import all from preview
  const handleImportPreviewAll = useCallback(async () => {
    const currentIntegrationId = getActiveIntegrationId();
    if (!previewData || !currentIntegrationId) return;

    const projectNames = previewData.new_projects.map((p) => p.name || "").filter(Boolean);

    setImportingProjects(new Set(projectNames));

    try {
      await importVercelProjects(
        {
          import_all: false,
          project_names: projectNames,
        },
        currentIntegrationId
      );
    } catch {
      // Error handled by store
    } finally {
      setImportingProjects(new Set());
    }
  }, [previewData, importVercelProjects, getActiveIntegrationId]);

  // Get current integration info
  const currentIntegration = integrations.find(i => i.id === activeIntegrationId);

  // Determine loading state
  const isLoading = isLoadingProjects || isLoadingIntegrations;
  const isImportingAny = isImporting;
  const hasError = projectsError || integrationsError;
  const hasProjects = projects.length > 0;
  const hasIntegrations = integrations.length > 0;
  const noIntegrationSelected = !activeIntegrationId && hasIntegrations;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Show content only when integration is selected */}
      {activeIntegrationId && (
        <>
          {/* Page Header */}
          <ImportHeader
            totalProjects={projects.length}
            selectedCount={selectedProjects.size}
            isLoading={isLoading}
            onImportAll={handleImportAll}
            onImportSelected={handleImportSelected}
            onRefresh={() => fetchProjects()}
            isImporting={isImportingAny}
          />

          {/* Import Status Notifications */}
          <ImportStatus
            importResult={importResult}
            isImporting={isImportingAny}
            importError={importError}
            importResponse={importResponse}
            singleResults={singleImportResults}
          />

          {/* Preview Toggle */}
          {hasProjects && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowPreview(!showPreview);
                  if (!showPreview) handlePreview();
                }}
                className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
              >
                <svg
                  className={`h-4 w-4 transition-transform ${showPreview ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                {showPreview ? "Hide preview" : "Show import preview"}
              </button>
            </div>
          )}

          {/* Preview Section */}
          {showPreview && (
            <PreviewSection
              previewData={previewData}
              isPreviewing={isPreviewing}
              previewError={previewError}
              onImportAll={handleImportPreviewAll}
              onImportSelected={handleImportPreviewSelected}
              selectedProjects={selectedProjects}
              onSelectProject={handleSelectProject}
            />
          )}

          {/* Main Content */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : hasError ? (
            <ErrorState error={hasError} onRetry={() => fetchProjects()} />
          ) : !hasProjects ? (
            <EmptyState onRefresh={() => fetchProjects()} isLoading={isLoading} />
          ) : (
            <ProjectList
              projects={projects}
              selectedProjects={selectedProjects}
              importingProjects={importingProjects}
              importResults={singleImportResults}
              onSelectProject={handleSelectProject}
              onImportSingle={handleImportSingle}
              onSelectAll={handleSelectAll}
            />
          )}

          {/* Pagination */}
          {projectsPagination?.has_more && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() =>
                  listVercelProjects({
                    page: (projectsPagination.current_page || 1) + 1,
                    limit: projectsPagination.limit || 20,
                    integration_id: getActiveIntegrationId() || undefined,
                  })
                }
                disabled={isLoading}
                className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors px-4 py-2 rounded-lg border border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 disabled:opacity-50"
              >
                Load more projects
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};