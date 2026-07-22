"use client";

// GitHubImportPage.tsx
// Main page component for GitHub project import
// Route: /[username]/settings/account/github

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  useGitHubInstallationRepos,
  useGitHubPreview,
  useGitHubImport,
  useGitHubSingleImport,
  useGitHubBatchImport,
  useGitHubInstallationId,
  GitHubRepositoryInfo,
  GitHubSingleImportResponse,
} from "@/lib/stores/linked_platforms/github/github-integration.store";

import { ImportHeader } from "./ImportHeader";
import { RepositoryList } from "./RepositoryList";
import { PreviewSection } from "./PreviewSection";
import { ImportStatus } from "./ImportStatus";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingSkeleton } from "./LoadingSkeleton";

export const GitHubImportPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params?.username as string;

  // Local state
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [importingRepos, setImportingRepos] = useState<Set<string>>(new Set());
  const [singleImportResults, setSingleImportResults] = useState<
    Record<string, GitHubSingleImportResponse>
  >({});
  const [showPreview, setShowPreview] = useState(false);

  // Store hooks
  const {
    installationRepositories,
    isLoadingInstallationRepos,
    installationReposError,
    installationReposPagination,
    getInstallationRepositories,
    resetInstallationRepos,
  } = useGitHubInstallationRepos();

  const {
    previewData,
    isPreviewing,
    previewError,
    previewImport,
    resetPreviewState,
  } = useGitHubPreview();

  const {
    isImportingByInstallation,
    installationImportResponse,
    installationImportError,
    importByInstallation,
    resetImportState,
  } = useGitHubImport();

  const {
    isImportingSingle,
    singleImportResult,
    singleImportError,
    importSingleRepository,
  } = useGitHubSingleImport();

  const {
    isImportingBatch,
    batchImportResult,
    batchImportError,
    importMultipleRepositories,
  } = useGitHubBatchImport();

  const {
    activeInstallationId,
  } = useGitHubInstallationId();

  // Fetch repositories on mount
  useEffect(() => {
    fetchRepositories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInstallationId]);

  const fetchRepositories = useCallback(() => {
    resetInstallationRepos();
    resetPreviewState();
    resetImportState();
    setSelectedRepos(new Set());
    setImportingRepos(new Set());
    setSingleImportResults({});
    setShowPreview(false);

    getInstallationRepositories({
      page: 1,
      per_page: 100,
      installation_id: activeInstallationId || undefined,
    });
  }, [
    getInstallationRepositories,
    resetInstallationRepos,
    resetPreviewState,
    resetImportState,
    activeInstallationId,
  ]);

  // Handle preview import
  const handlePreview = useCallback(async () => {
    if (!username) return;

    setShowPreview(true);
    resetPreviewState();

    try {
      await previewImport({
        github_username: username,
        import_all: true,
        installation_id: activeInstallationId || undefined,
      });
    } catch {
      // Error handled by store
    }
  }, [username, previewImport, resetPreviewState, activeInstallationId]);

  // Handle select/deselect a single repo
  const handleSelectRepo = useCallback((repoName: string, selected: boolean) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(repoName);
      } else {
        next.delete(repoName);
      }
      return next;
    });
  }, []);

  // Handle select all / deselect all
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedRepos(new Set(installationRepositories.map((r) => r.name)));
      } else {
        setSelectedRepos(new Set());
      }
    },
    [installationRepositories]
  );

  // Handle import single repository
  const handleImportSingle = useCallback(
    async (repo: GitHubRepositoryInfo) => {
      setImportingRepos((prev) => {
        const next = new Set(prev);
        next.add(repo.name);
        return next;
      });

      try {
        const result = await importSingleRepository({
          repo_data: {
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            description: repo.description,
            language: repo.language,
            topics: repo.topics,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            private: repo.private,
            archived: repo.archived,
            default_branch: repo.default_branch,
            clone_url: repo.clone_url,
            ssh_url: repo.ssh_url,
          },
          skip_duplicates: true,
          installation_id: activeInstallationId || undefined,
        });

        setSingleImportResults((prev) => ({
          ...prev,
          ...(result ? { [repo.name]: result } : {}),
        }));
      } catch {
        setSingleImportResults((prev) => ({
          ...prev,
          [repo.name]: {
            success: false,
            message: singleImportError || "Import failed",
            repo_name: repo.name,
            repo_url: repo.html_url,
          },
        }));
      } finally {
        setImportingRepos((prev) => {
          const next = new Set(prev);
          next.delete(repo.name);
          return next;
        });
      }
    },
    [importSingleRepository, singleImportError, activeInstallationId]
  );

  // Handle import all repositories
  const handleImportAll = useCallback(async () => {
    if (installationRepositories.length === 0 || !activeInstallationId) return;

    const repos = installationRepositories.map((repo) => ({
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      topics: repo.topics,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      private: repo.private,
      archived: repo.archived,
      default_branch: repo.default_branch,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
    }));

    setImportingRepos(new Set(repos.map((r) => r.name)));

    try {
      await importMultipleRepositories({
        repositories: repos,
        installation_id: activeInstallationId,
        skip_duplicates: true,
        commit_batch_size: 10,
      });
    } catch {
      // Error handled by store
    } finally {
      setImportingRepos(new Set());
    }
  }, [installationRepositories, importMultipleRepositories, activeInstallationId]);

  // Handle import selected repositories
  const handleImportSelected = useCallback(async () => {
    if (selectedRepos.size === 0 || !activeInstallationId) return;

    const reposToImport = installationRepositories
      .filter((repo) => selectedRepos.has(repo.name))
      .map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        topics: repo.topics,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        private: repo.private,
        archived: repo.archived,
        default_branch: repo.default_branch,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
      }));

    setImportingRepos(new Set(reposToImport.map((r) => r.name)));

    try {
      await importMultipleRepositories({
        repositories: reposToImport,
        installation_id: activeInstallationId,
        skip_duplicates: true,
        commit_batch_size: 10,
      });
      setSelectedRepos(new Set());
    } catch {
      // Error handled by store
    } finally {
      setImportingRepos(new Set());
    }
  }, [selectedRepos, installationRepositories, importMultipleRepositories, activeInstallationId]);

  // Handle import from preview (selected new projects)
  const handleImportPreviewSelected = useCallback(
    async (projectNames: string[]) => {
      if (!previewData || projectNames.length === 0 || !activeInstallationId) return;

      const reposToImport = previewData.new_projects
        .filter((p) => projectNames.includes(p.name))
        .map((project) => ({
          name: project.name,
          full_name: `${previewData.github_username}/${project.name}`,
          html_url: project.html_url,
          description: project.description,
          language: project.language,
          stargazers_count: project.stars,
        }));

      setImportingRepos(new Set(reposToImport.map((r) => r.name)));

      try {
        await importMultipleRepositories({
          repositories: reposToImport,
          installation_id: activeInstallationId,
          skip_duplicates: true,
          commit_batch_size: 10,
        });
      } catch {
        // Error handled by store
      } finally {
        setImportingRepos(new Set());
      }
    },
    [previewData, importMultipleRepositories, activeInstallationId]
  );

  // Handle import all from preview
  const handleImportPreviewAll = useCallback(async () => {
    if (!previewData || !activeInstallationId) return;

    const reposToImport = previewData.new_projects.map((project) => ({
      name: project.name,
      full_name: `${previewData.github_username}/${project.name}`,
      html_url: project.html_url,
      description: project.description,
      language: project.language,
      stargazers_count: project.stars,
    }));

    setImportingRepos(new Set(reposToImport.map((r) => r.name)));

    try {
      await importMultipleRepositories({
        repositories: reposToImport,
        installation_id: activeInstallationId,
        skip_duplicates: true,
        commit_batch_size: 10,
      });
    } catch {
      // Error handled by store
    } finally {
      setImportingRepos(new Set());
    }
  }, [previewData, importMultipleRepositories, activeInstallationId]);

  // Determine loading state
  const isLoading = isLoadingInstallationRepos;
  const isImporting = isImportingSingle || isImportingBatch || isImportingByInstallation;
  const hasError = installationReposError;
  const hasRepos = installationRepositories.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Installation ID Banner */}
      {activeInstallationId && (
        <div className="rounded-lg border border-blue-200 p-3">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/70">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Installation ID: {activeInstallationId}</span>
          </div>
        </div>
      )}

      {/* No Installation ID Warning */}
      {!activeInstallationId && !isLoading && (
        <div className="rounded-lg border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-medium text-sm text-[var(--foreground)]">No Installation ID Found</p>
              <p className="text-xs text-[var(--foreground)]/60 mt-0.5">
                Please provide an installation_id in the URL query parameters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <ImportHeader
        totalRepos={installationRepositories.length}
        selectedCount={selectedRepos.size}
        isLoading={isLoading}
        onImportAll={handleImportAll}
        onImportSelected={handleImportSelected}
        onRefresh={fetchRepositories}
        isImporting={isImporting}
        installationId={activeInstallationId || undefined}
      />

      {/* Import Status Notifications */}
      <ImportStatus
        batchResult={batchImportResult}
        isImportingBatch={isImportingBatch}
        batchError={batchImportError}
        singleResults={singleImportResults}
        installationId={activeInstallationId || undefined}
      />

      {/* Installation Import Response */}
      {installationImportResponse && (
        <div className="rounded-lg border border-green-200 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-sm text-[var(--foreground)]">
                {installationImportResponse.status === "success" ? "Import initiated" : "Import status"}
              </p>
              <p className="text-xs text-[var(--foreground)]/60 mt-0.5">
                {installationImportResponse.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {installationImportError && (
        <div className="rounded-lg border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-medium text-sm text-[var(--foreground)]">Import failed</p>
              <p className="text-xs text-[var(--foreground)]/60 mt-0.5">{installationImportError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Toggle */}
      {hasRepos && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
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
          selectedRepos={selectedRepos}
          onSelectRepo={handleSelectRepo}
          installationId={activeInstallationId || undefined}
        />
      )}

      {/* Main Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : hasError ? (
        <ErrorState
          error={hasError}
          onRetry={fetchRepositories}
          installationId={activeInstallationId || undefined}
        />
      ) : !hasRepos ? (
        <EmptyState
          onRefresh={fetchRepositories}
          isLoading={isLoading}
          installationId={activeInstallationId || undefined}
          message={!activeInstallationId ? "Provide an installation_id to view repositories" : undefined}
        />
      ) : (
        <RepositoryList
          repositories={installationRepositories}
          selectedRepos={selectedRepos}
          importingRepos={importingRepos}
          importResults={singleImportResults}
          onSelectRepo={handleSelectRepo}
          onImportSingle={handleImportSingle}
          onSelectAll={handleSelectAll}
          installationId={activeInstallationId || undefined}
        />
      )}

      {/* Pagination */}
      {installationReposPagination?.has_more && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() =>
              getInstallationRepositories({
                page: (installationReposPagination.page || 1) + 1,
                per_page: installationReposPagination.per_page || 30,
                installation_id: activeInstallationId || undefined,
              })
            }
            disabled={isLoading}
            className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors px-4 py-2 rounded-lg border border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 disabled:opacity-50"
          >
            Load more repositories
          </button>
        </div>
      )}
    </div>
  );
};