import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  CloudinarySliceState,
  ResourceType,
  UploadResponse,
  AssetInfo,
  UrlUploadRequest,
  UrlGenerationRequest,
  AssetUpdateRequest,
} from "./types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CloudinaryCoreState extends CloudinarySliceState {
  // Cached results
  assetInfo: AssetInfo | null;
  configInfo: { cloud_name: string; secure: boolean; configured: boolean } | null;

  // Actions — mirrors /cloudinary/core/*
  uploadFile: (params: UploadFileParams) => Promise<UploadResponse>;
  deleteFile: (public_id: string, resource_type: ResourceType) => Promise<{ result: string }>;
  uploadFromUrl: (request: UrlUploadRequest) => Promise<UploadResponse>;
  generateUrl: (request: UrlGenerationRequest) => Promise<string>;
  getAssetInfo: (public_id: string, resource_type?: ResourceType) => Promise<AssetInfo>;
  deleteAsset: (public_id: string, resource_type?: ResourceType, invalidate?: boolean) => Promise<Record<string, unknown>>;
  updateAsset: (request: AssetUpdateRequest) => Promise<Record<string, unknown>>;
  checkAssetExists: (public_id: string, resource_type?: ResourceType) => Promise<boolean>;
  createFolder: (folder_path: string) => Promise<Record<string, unknown>>;
  deleteFolder: (folder_path: string) => Promise<Record<string, unknown>>;
  healthCheck: () => Promise<{ status: string; service: string }>;
  getConfigInfo: () => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

export interface UploadFileParams {
  file: File;
  public_id?: string;
  folder?: string;
  tags?: string;
  resource_type?: ResourceType;
  overwrite?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCloudinaryCore = create<CloudinaryCoreState>()((set) => ({
  isLoading: false,
  error: null,
  assetInfo: null,
  configInfo: null,

  // POST /cloudinary/core/upload-file
  uploadFile: async ({ file, public_id, folder, tags, resource_type = "auto", overwrite = true }) => {
    set({ isLoading: true, error: null });
    try {
      const form = new FormData();
      form.append("file", file);
      if (public_id) form.append("public_id", public_id);
      if (folder) form.append("folder", folder);

      const params = new URLSearchParams();
      if (tags) params.set("tags", tags);
      if (resource_type) params.set("resource_type", resource_type);
      params.set("overwrite", String(overwrite));

      const res = await api.post<UploadResponse>(
        `cloudinary/core/upload-file?${params}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to upload file") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/core/delete-file
  deleteFile: async (public_id, resource_type) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ result: string }>(
        `cloudinary/core/delete-file?public_id=${encodeURIComponent(public_id)}&resource_type=${resource_type}`
      );
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to delete file") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/core/upload-url
  uploadFromUrl: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<UploadResponse>("cloudinary/core/upload-url", request);
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to upload from URL") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/core/generate-url
  generateUrl: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ url: string }>("cloudinary/core/generate-url", request);
      return res.data.url;
    } catch (err) {
      set({ error: errMsg(err, "Failed to generate URL") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/core/asset-info/{public_id}
  getAssetInfo: async (public_id, resource_type = "image") => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<AssetInfo>(
        `cloudinary/core/asset-info/${encodeURIComponent(public_id)}?resource_type=${resource_type}`
      );
      set({ assetInfo: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to fetch asset info") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // DELETE /cloudinary/core/asset/{public_id}
  deleteAsset: async (public_id, resource_type = "image", invalidate = true) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.delete<Record<string, unknown>>(
        `cloudinary/core/asset/${encodeURIComponent(public_id)}?resource_type=${resource_type}&invalidate=${invalidate}`
      );
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to delete asset") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // PUT /cloudinary/core/asset
  updateAsset: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put<Record<string, unknown>>("cloudinary/core/asset", request);
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to update asset") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/core/asset-exists/{public_id}
  checkAssetExists: async (public_id, resource_type = "image") => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ exists: boolean }>(
        `cloudinary/core/asset-exists/${encodeURIComponent(public_id)}?resource_type=${resource_type}`
      );
      return res.data.exists;
    } catch (err) {
      set({ error: errMsg(err, "Failed to check asset existence") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/core/create-folder
  createFolder: async (folder_path) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<Record<string, unknown>>(
        `cloudinary/core/create-folder?folder_path=${encodeURIComponent(folder_path)}`
      );
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to create folder") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // DELETE /cloudinary/core/folder
  deleteFolder: async (folder_path) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.delete<Record<string, unknown>>(
        `cloudinary/core/folder?folder_path=${encodeURIComponent(folder_path)}`
      );
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to delete folder") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/core/health
  healthCheck: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ status: string; service: string }>("cloudinary/core/health");
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Health check failed") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/core/config
  getConfigInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ cloud_name: string; secure: boolean; configured: boolean }>(
        "cloudinary/core/config"
      );
      set({ configInfo: res.data });
    } catch (err) {
      set({ error: errMsg(err, "Failed to fetch config info") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({ isLoading: false, error: null, assetInfo: null, configInfo: null }),
}));
