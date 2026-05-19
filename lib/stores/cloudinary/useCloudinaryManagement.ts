import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  CloudinarySliceState,
  ResourceType,
  BulkOperationResult,
  UsageReport,
  ArchiveOptions,
  BackupOptions,
  BulkTagUpdateRequest,
  MigrationRequest,
} from "./types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CloudinaryManagementState extends CloudinarySliceState {
  usageReport: UsageReport | null;
  folderStructure: Record<string, unknown> | null;
  duplicates: Array<Record<string, unknown>> | null;
  lastBulkResult: BulkOperationResult | null;
  archiveUrl: string | null;

  // Actions — mirrors /cloudinary/manage/*
  backupAssets: (options: BackupOptions) => Promise<BulkOperationResult>;
  restoreFromBackup: (params: RestoreParams) => Promise<BulkOperationResult>;
  cleanupOldBackups: (params: CleanupParams) => Promise<BulkOperationResult>;
  createArchive: (options: ArchiveOptions) => Promise<string>;
  getUsageReport: () => Promise<UsageReport>;
  organizeByDate: (params: OrganizeByDateParams) => Promise<BulkOperationResult>;
  findDuplicates: (params: FindDuplicatesParams) => Promise<Array<Record<string, unknown>>>;
  bulkUpdateTags: (request: BulkTagUpdateRequest) => Promise<BulkOperationResult>;
  getFolderStructure: (params?: FolderStructureParams) => Promise<Record<string, unknown>>;
  migrateAssets: (request: MigrationRequest) => Promise<BulkOperationResult>;

  clearError: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Param types
// ---------------------------------------------------------------------------

export interface RestoreParams {
  backup_timestamp: string;
  backup_folder?: string;
  target_folder?: string;
  overwrite?: boolean;
}

export interface CleanupParams {
  backup_folder?: string;
  days_to_keep?: number;
}

export interface OrganizeByDateParams {
  source_folder?: string;
  date_format?: string;
  resource_type?: ResourceType;
  dry_run?: boolean;
}

export interface FindDuplicatesParams {
  resource_type?: ResourceType;
  comparison_method?: string;
  threshold?: number;
}

export interface FolderStructureParams {
  max_depth?: number;
  include_asset_count?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined) qs.set(key, String(val));
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCloudinaryManagement = create<CloudinaryManagementState>()((set) => ({
  isLoading: false,
  error: null,
  usageReport: null,
  folderStructure: null,
  duplicates: null,
  lastBulkResult: null,
  archiveUrl: null,

  // POST /cloudinary/manage/backup
  backupAssets: async (options) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<BulkOperationResult>("cloudinary/manage/backup", options);
      set({ lastBulkResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to backup assets") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/manage/restore
  restoreFromBackup: async ({
    backup_timestamp,
    backup_folder = "backups",
    target_folder,
    overwrite = false,
  }) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ backup_timestamp, backup_folder, target_folder, overwrite });
      const res = await api.post<BulkOperationResult>(`cloudinary/manage/restore${qs}`);
      set({ lastBulkResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to restore from backup") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // DELETE /cloudinary/manage/cleanup-backups
  cleanupOldBackups: async ({ backup_folder = "backups", days_to_keep = 30 } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ backup_folder, days_to_keep });
      const res = await api.delete<BulkOperationResult>(`cloudinary/manage/cleanup-backups${qs}`);
      set({ lastBulkResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to cleanup old backups") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/manage/create-archive
  createArchive: async (options) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ archive_url: string }>(
        "cloudinary/manage/create-archive",
        options
      );
      set({ archiveUrl: res.data.archive_url });
      return res.data.archive_url;
    } catch (err) {
      set({ error: errMsg(err, "Failed to create archive") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/manage/usage-report
  getUsageReport: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<UsageReport>("cloudinary/manage/usage-report");
      set({ usageReport: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to fetch usage report") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/manage/organize-by-date
  organizeByDate: async ({
    source_folder,
    date_format = "%Y/%m",
    resource_type = "image",
    dry_run = false,
  } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ source_folder, date_format, resource_type, dry_run });
      const res = await api.post<BulkOperationResult>(`cloudinary/manage/organize-by-date${qs}`);
      set({ lastBulkResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to organize assets by date") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/manage/find-duplicates
  findDuplicates: async ({
    resource_type = "image",
    comparison_method = "phash",
    threshold = 0.9,
  } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ resource_type, comparison_method, threshold });
      const res = await api.get<{ duplicates: Array<Record<string, unknown>> }>(
        `cloudinary/manage/find-duplicates${qs}`
      );
      set({ duplicates: res.data.duplicates });
      return res.data.duplicates;
    } catch (err) {
      set({ error: errMsg(err, "Failed to find duplicate assets") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // PUT /cloudinary/manage/bulk-update-tags
  bulkUpdateTags: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put<BulkOperationResult>(
        "cloudinary/manage/bulk-update-tags",
        request
      );
      set({ lastBulkResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to bulk update tags") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/manage/folder-structure
  getFolderStructure: async ({ max_depth = 5, include_asset_count = true } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ max_depth, include_asset_count });
      const res = await api.get<{ folder_structure: Record<string, unknown> }>(
        `cloudinary/manage/folder-structure${qs}`
      );
      set({ folderStructure: res.data.folder_structure });
      return res.data.folder_structure;
    } catch (err) {
      set({ error: errMsg(err, "Failed to fetch folder structure") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/manage/migrate-assets
  migrateAssets: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<BulkOperationResult>(
        "cloudinary/manage/migrate-assets",
        request
      );
      set({ lastBulkResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to migrate assets") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      isLoading: false,
      error: null,
      usageReport: null,
      folderStructure: null,
      duplicates: null,
      lastBulkResult: null,
      archiveUrl: null,
    }),
}));
