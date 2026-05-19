import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  CloudinarySliceState,
  BulkOperationResult,
  BatchTransformRequest,
  BatchDeleteRequest,
} from "./types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CloudinaryBatchState extends CloudinarySliceState {
  lastResult: BulkOperationResult | null;

  // Actions — mirrors /cloudinary/batch/*
  batchTransform: (request: BatchTransformRequest) => Promise<BulkOperationResult>;
  batchDelete: (request: BatchDeleteRequest) => Promise<BulkOperationResult>;

  clearError: () => void;
  reset: () => void;
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

export const useCloudinaryBatch = create<CloudinaryBatchState>()((set) => ({
  isLoading: false,
  error: null,
  lastResult: null,

  // POST /cloudinary/batch/transform
  batchTransform: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<BulkOperationResult>("cloudinary/batch/transform", request);
      set({ lastResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to batch transform assets") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // DELETE /cloudinary/batch/assets
  batchDelete: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.delete<BulkOperationResult>("cloudinary/batch/assets", {
        data: request,
      });
      set({ lastResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to batch delete assets") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({ isLoading: false, error: null, lastResult: null }),
}));
