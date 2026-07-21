// types.ts
// Shared types for the GitHub Import components

import {
  GitHubRepositoryInfo,
  GitHubPreviewResponse,
  GitHubProjectPreview,
  GitHubBatchImportResponse,
  GitHubSingleImportResponse,
} from "@/lib/stores/linked_platforms/github/github-integration.store";

export interface RepositoryCardProps {
  repo: GitHubRepositoryInfo;
  isSelected: boolean;
  isImporting: boolean;
  importStatus?: "idle" | "loading" | "success" | "error";
  installationId?: string; // Added for installation context
  onSelect: (repoName: string, selected: boolean) => void;
  onImportSingle: (repo: GitHubRepositoryInfo, installationId?: string) => void; // Updated signature
}

export interface RepositoryListProps {
  repositories: GitHubRepositoryInfo[];
  selectedRepos: Set<string>;
  importingRepos: Set<string>;
  importResults: Record<string, GitHubSingleImportResponse>;
  installationId?: string; // Added for installation context
  onSelectRepo: (repoName: string, selected: boolean) => void;
  onImportSingle: (repo: GitHubRepositoryInfo, installationId?: string) => void; // Updated signature
  onSelectAll: (selected: boolean) => void;
}

export interface PreviewSectionProps {
  previewData: GitHubPreviewResponse | null;
  isPreviewing: boolean;
  previewError: string | null;
  installationId?: string; // Added for installation context
  onImportAll: (installationId?: string) => void; // Updated signature
  onImportSelected: (projectNames: string[], installationId?: string) => void; // Updated signature
  selectedRepos: Set<string>;
  onSelectRepo: (repoName: string, selected: boolean) => void;
}

export interface ImportHeaderProps {
  totalRepos: number;
  selectedCount: number;
  isLoading: boolean;
  installationId?: string; // Added for installation context
  onImportAll: (installationId?: string) => void; // Updated signature
  onImportSelected: (installationId?: string) => void; // Updated signature
  onRefresh: () => void;
  isImporting: boolean;
}

export interface ImportStatusProps {
  batchResult: GitHubBatchImportResponse | null;
  isImportingBatch: boolean;
  batchError: string | null;
  singleResults: Record<string, GitHubSingleImportResponse>;
  installationId?: string; // Added to show which installation this status belongs to
}

export interface EmptyStateProps {
  onRefresh: () => void;
  isLoading: boolean;
  installationId?: string; // Added for context
  message?: string; // Added for custom messages
}

export interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  installationId?: string; // Added for context
}

// New interfaces for installation-specific functionality
export interface InstallationSelectorProps {
  installations: InstallationInfo[];
  activeInstallationId: string | null;
  onSelectInstallation: (installationId: string) => void;
  isLoading: boolean;
}

export interface InstallationInfo {
  installation_id: string;
  account_name: string;
  account_type: "User" | "Organization";
  avatar_url?: string;
  repository_count: number;
  is_active: boolean;
}

// Updated GitHubImportRequest to include installation_id
export interface GitHubImportRequest {
  github_username?: string;
  import_all: boolean;
  project_names?: string[];
  installation_id?: string;
}

// For tracking import progress per installation
export interface InstallationImportState {
  installationId: string;
  selectedRepos: Set<string>;
  importingRepos: Set<string>;
  importResults: Record<string, GitHubSingleImportResponse>;
  batchResult: GitHubBatchImportResponse | null;
  isImporting: boolean;
  error: string | null;
}

// For managing multiple installations
export interface MultiInstallationState {
  activeInstallationId: string | null;
  installations: Record<string, InstallationImportState>;
  availableInstallations: InstallationInfo[];
  isLoadingInstallations: boolean;
  installationsError: string | null;
}
