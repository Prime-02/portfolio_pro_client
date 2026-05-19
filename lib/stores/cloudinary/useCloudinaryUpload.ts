import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  CloudinarySliceState,
  UploadResponse,
  BulkOperationResult,
  Base64UploadRequest,
  UploadMultipleFilesParams,
  UploadMultipleUrlsRequest,
  UploadEagerTransformationsParams,
  UploadAutoTaggingParams,
  UploadLargeFileParams,
  UploadPreprocessingParams,
} from "./types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CloudinaryUploadState extends CloudinarySliceState {
  lastUpload: UploadResponse | null;
  lastBulkResult: BulkOperationResult | null;

  // Actions — mirrors /cloudinary/upload/*
  uploadBase64: (request: Base64UploadRequest) => Promise<UploadResponse>;
  uploadMultipleFiles: (params: UploadMultipleFilesParams) => Promise<BulkOperationResult>;
  uploadMultipleUrls: (request: UploadMultipleUrlsRequest) => Promise<BulkOperationResult>;
  uploadWithEagerTransformations: (params: UploadEagerTransformationsParams) => Promise<UploadResponse>;
  uploadWithAutoTagging: (params: UploadAutoTaggingParams) => Promise<UploadResponse>;
  uploadLargeFile: (params: UploadLargeFileParams) => Promise<UploadResponse>;
  uploadWithPreprocessing: (params: UploadPreprocessingParams) => Promise<UploadResponse>;

  clearError: () => void;
  reset: () => void;
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

export const useCloudinaryUpload = create<CloudinaryUploadState>()((set) => ({
  isLoading: false,
  error: null,
  lastUpload: null,
  lastBulkResult: null,

  // POST /cloudinary/upload/base64
  uploadBase64: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<UploadResponse>("cloudinary/upload/base64", request);
      set({ lastUpload: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to upload base64 file") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/upload/multiple-files
  uploadMultipleFiles: async ({ files, folder, tags, resource_type = "auto", max_concurrent = 5 }) => {
    set({ isLoading: true, error: null });
    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));

      const qs = buildQueryString({ folder, tags, resource_type, max_concurrent });
      const res = await api.post<BulkOperationResult>(
        `cloudinary/upload/multiple-files${qs}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      set({ lastBulkResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to upload multiple files") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/upload/multiple-urls
  uploadMultipleUrls: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<BulkOperationResult>("cloudinary/upload/multiple-urls", request);
      set({ lastBulkResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to upload multiple URLs") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/upload/eager-transformations
  uploadWithEagerTransformations: async ({
    file_url,
    eager_transformations,
    public_id,
    folder,
    tags,
    resource_type = "auto",
  }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<UploadResponse>("cloudinary/upload/eager-transformations", {
        file_url,
        eager_transformations,
        public_id,
        folder,
        tags,
        resource_type,
      });
      set({ lastUpload: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to upload with eager transformations") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/upload/auto-tagging
  uploadWithAutoTagging: async ({
    file_url,
    auto_tagging = 0.7,
    public_id,
    folder,
    additional_tags,
    resource_type = "auto",
  }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<UploadResponse>("cloudinary/upload/auto-tagging", {
        file_url,
        auto_tagging,
        public_id,
        folder,
        additional_tags,
        resource_type,
      });
      set({ lastUpload: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to upload with auto-tagging") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/upload/large-file
  uploadLargeFile: async ({
    file,
    chunk_size = 20000000,
    public_id,
    folder,
    tags,
    resource_type = "auto",
  }) => {
    set({ isLoading: true, error: null });
    try {
      const form = new FormData();
      form.append("file", file);

      const qs = buildQueryString({ chunk_size, public_id, folder, tags, resource_type });
      const res = await api.post<UploadResponse>(
        `cloudinary/upload/large-file${qs}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      set({ lastUpload: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to upload large file") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/upload/preprocessing
  uploadWithPreprocessing: async ({
    file_url,
    preprocessing_steps,
    public_id,
    folder,
    tags,
    resource_type = "auto",
  }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<UploadResponse>("cloudinary/upload/preprocessing", {
        file_url,
        preprocessing_steps,
        public_id,
        folder,
        tags,
        resource_type,
      });
      set({ lastUpload: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to upload with preprocessing") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({ isLoading: false, error: null, lastUpload: null, lastBulkResult: null }),
}));
