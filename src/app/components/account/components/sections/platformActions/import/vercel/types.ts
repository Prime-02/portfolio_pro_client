// types.ts
// Shared types for the Vercel Import components

import {
  VercelProjectInfo,
  VercelPreviewResponse,
  VercelProjectPreview,
  VercelImportResult,
} from "@/lib/stores/linked_platforms/vercel/useVercelProjects";

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
  importResponse: { status: string; message: string } | null;
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
