// types.ts
// Shared types for the Vercel Import components

import {
  VercelProjectInfo,
  VercelPreviewResponse,
  VercelImportResult,
  VercelIntegrationInfo,
} from "@/lib/stores/linked_platforms/vercel/vercel-integration.store";

export interface ProjectCardProps {
  project: VercelProjectInfo;
  isSelected: boolean;
  isImporting: boolean;
  importStatus?: "idle" | "loading" | "success" | "error";
  onSelect: (projectName: string, selected: boolean) => void;
  onImportSingle: (project: VercelProjectInfo) => void;
}

export interface ProjectListProps {
  projects: VercelProjectInfo[];
  selectedProjects: Set<string>;
  importingProjects: Set<string>;
  importResults: Record<string, { success: boolean; message: string }>;
  onSelectProject: (projectName: string, selected: boolean) => void;
  onImportSingle: (project: VercelProjectInfo) => void;
  onSelectAll: (selected: boolean) => void;
}

export interface PreviewSectionProps {
  previewData: VercelPreviewResponse | null;
  isPreviewing: boolean;
  previewError: string | null;
  onImportAll: () => void;
  onImportSelected: (projectNames: string[]) => void;
  selectedProjects: Set<string>;
  onSelectProject: (projectName: string, selected: boolean) => void;
}

export interface ImportHeaderProps {
  totalProjects: number;
  selectedCount: number;
  isLoading: boolean;
  onImportAll: () => void;
  onImportSelected: () => void;
  onRefresh: () => void;
  isImporting: boolean;
}

export interface ImportStatusProps {
  importResult: VercelImportResult | null;
  isImporting: boolean;
  importError: string | null;
  importResponse: {
    status: string;
    message: string;
    integration_id?: string;
  } | null;
  singleResults: Record<string, { success: boolean; message: string }>;
}

export interface EmptyStateProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

// ============ New Integration Management Types ============

export interface IntegrationSelectorProps {
  integrations: VercelIntegrationInfo[];
  activeIntegrationId: string | null;
  isLoading: boolean;
  error: string | null;
  onSelectIntegration: (integrationId: string) => void;
  onManageIntegrations: () => void;
}

export interface IntegrationCardProps {
  integration: VercelIntegrationInfo;
  isActive: boolean;
  isPrimary: boolean;
  onSelect: (integrationId: string) => void;
  onSetPrimary: (integrationId: string) => void;
  onUnlink: (integrationId: string) => void;
}

export interface LinkVercelAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (token: string, setAsPrimary?: boolean) => Promise<void>;
  isLinking: boolean;
  error: string | null;
}

export interface VercelIntegrationListProps {
  integrations: VercelIntegrationInfo[];
  activeIntegrationId: string | null;
  isLoading: boolean;
  error: string | null;
  onSelectIntegration: (integrationId: string) => void;
  onSetPrimary: (integrationId: string) => void;
  onUnlink: (integrationId: string) => void;
  onLinkNew: () => void;
}

export interface VercelAccountSwitcherProps {
  integrations: VercelIntegrationInfo[];
  activeIntegrationId: string | null;
  isLoading: boolean;
  onSwitch: (integrationId: string) => void;
  onManageAccounts: () => void;
}

// ============ Import Flow Types (Updated) ============

export interface ImportFlowContainerProps {
  // Integration selection
  integrations: VercelIntegrationInfo[];
  activeIntegrationId: string | null;
  isLoadingIntegrations: boolean;
  integrationsError: string | null;
  onSelectIntegration: (integrationId: string) => void;
  onManageIntegrations: () => void;

  // Project listing
  projects: VercelProjectInfo[];
  isLoadingProjects: boolean;
  projectsError: string | null;
  projectsPagination: {
    current_page: number;
    limit: number;
    next?: number;
    prev?: number;
    count?: number;
    has_more: boolean;
  } | null;

  // Import state
  isImporting: boolean;
  importError: string | null;
  importResponse: {
    status: string;
    message: string;
    integration_id?: string;
  } | null;
  importResult: VercelImportResult | null;

  // Preview state
  previewData: VercelPreviewResponse | null;
  isPreviewing: boolean;
  previewError: string | null;

  // Actions
  onRefreshProjects: (params?: {
    page?: number;
    limit?: number;
    until?: number;
  }) => void;
  onImportAll: () => void;
  onImportSelected: (projectNames: string[]) => void;
  onPreviewImport: (request: {
    import_all: boolean;
    project_names?: string[];
    max_pages?: number;
  }) => void;
  onImportSingle: (project: VercelProjectInfo) => void;
  onLoadMoreProjects: () => void;
}

export interface VercelIntegrationBadgeProps {
  integration: VercelIntegrationInfo;
  showStatus?: boolean;
  showPrimary?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface VercelTokenInputProps {
  onSubmit: (token: string, setAsPrimary?: boolean) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  showPrimaryOption?: boolean;
}

export interface VercelIntegrationSettingsProps {
  integrations: VercelIntegrationInfo[];
  isLoading: boolean;
  error: string | null;
  onSetPrimary: (integrationId: string) => void;
  onUnlink: (integrationId: string) => void;
  onLinkNew: () => void;
  onRefresh: () => void;
  isSettingPrimary: boolean;
  isUnlinking: boolean;
}

export interface VercelProjectImportItemProps {
  project: VercelProjectInfo;
  isSelected: boolean;
  isImporting: boolean;
  importStatus?: "idle" | "loading" | "success" | "error";
  importMessage?: string;
  onSelect: (projectName: string, selected: boolean) => void;
  onImport: (project: VercelProjectInfo) => void;
}

export interface VercelImportProgressProps {
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  isImporting: boolean;
  estimatedTimeRemaining?: string;
}

export interface VercelImportSummaryProps {
  importResult: VercelImportResult;
  onViewProjects: () => void;
  onImportMore: () => void;
  onClose: () => void;
}

// ============ Event Handlers ============

export interface VercelIntegrationEventHandlers {
  onIntegrationSelected: (integrationId: string) => void;
  onIntegrationLinked: (integration: VercelIntegrationInfo) => void;
  onIntegrationUnlinked: (integrationId: string) => void;
  onPrimaryChanged: (integrationId: string) => void;
  onImportStarted: (importRequest: {
    import_all: boolean;
    project_names?: string[];
  }) => void;
  onImportCompleted: (result: VercelImportResult) => void;
  onImportFailed: (error: string) => void;
}

// ============ Navigation Types ============

export interface VercelIntegrationRouteParams {
  integrationId?: string;
  action?: "import" | "preview" | "manage" | "link";
}

export interface VercelImportRouteParams extends VercelIntegrationRouteParams {
  importType?: "all" | "selected";
  projectNames?: string[];
}
