import { create } from "zustand";
import { api } from "@/lib/client/api";
import type { CloudinarySliceState, VideoTransformRequest } from "./types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CloudinaryVideoState extends CloudinarySliceState {
  lastUrl: string | null;
  lastThumbnailUrl: string | null;

  // Actions — mirrors /cloudinary/video/*
  transformVideo: (request: VideoTransformRequest) => Promise<string>;
  generateThumbnail: (params: ThumbnailParams) => Promise<string>;

  clearError: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Param types
// ---------------------------------------------------------------------------

export interface ThumbnailParams {
  public_id: string;
  time_offset?: string;
  width?: string;
  height?: string;
  format?: string;
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

export const useCloudinaryVideo = create<CloudinaryVideoState>()((set) => ({
  isLoading: false,
  error: null,
  lastUrl: null,
  lastThumbnailUrl: null,

  // POST /cloudinary/video/transform
  transformVideo: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ url: string }>("cloudinary/video/transform", request);
      set({ lastUrl: res.data.url });
      return res.data.url;
    } catch (err) {
      set({ error: errMsg(err, "Failed to transform video") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/video/thumbnail
  generateThumbnail: async ({
    public_id,
    time_offset = "50%",
    width,
    height,
    format = "jpg",
  }) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ public_id, time_offset, width, height, format });
      const res = await api.post<{ thumbnail_url: string }>(
        `cloudinary/video/thumbnail${qs}`
      );
      set({ lastThumbnailUrl: res.data.thumbnail_url });
      return res.data.thumbnail_url;
    } catch (err) {
      set({ error: errMsg(err, "Failed to generate video thumbnail") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({ isLoading: false, error: null, lastUrl: null, lastThumbnailUrl: null }),
}));
