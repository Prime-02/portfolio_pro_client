import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  CloudinarySliceState,
  ResourceType,
  AITaggingRequest,
  ContentModerationRequest,
} from "./types";

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface AITaggingResult {
  public_id: string;
  ai_tags: string[];
  analysis: {
    colors: Array<[string, number]>;
    faces: Array<Record<string, unknown>>;
    quality_analysis: Record<string, unknown>;
    accessibility_analysis: Record<string, unknown>;
  };
}

export interface ModerationResult {
  public_id: string;
  moderation_results: Array<Record<string, unknown>>;
  status: string;
}

export interface ObjectDetectionResult {
  public_id: string;
  detection_results: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CloudinaryAIState extends CloudinarySliceState {
  lastTaggingResult: AITaggingResult | null;
  lastModerationResult: ModerationResult | null;
  lastDetectionResult: ObjectDetectionResult | null;
  lastUrl: string | null;

  // Actions — mirrors /cloudinary/ai/*
  getAITags: (request: AITaggingRequest) => Promise<AITaggingResult>;
  moderateContent: (request: ContentModerationRequest) => Promise<ModerationResult>;
  removeBackground: (params: BackgroundRemovalParams) => Promise<string>;
  detectObjects: (params: ObjectDetectionParams) => Promise<ObjectDetectionResult>;

  clearError: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Param types
// ---------------------------------------------------------------------------

export interface BackgroundRemovalParams {
  public_id: string;
  resource_type?: ResourceType;
}

export interface ObjectDetectionParams {
  public_id: string;
  resource_type?: ResourceType;
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

export const useCloudinaryAI = create<CloudinaryAIState>()((set) => ({
  isLoading: false,
  error: null,
  lastTaggingResult: null,
  lastModerationResult: null,
  lastDetectionResult: null,
  lastUrl: null,

  // POST /cloudinary/ai/auto-tag
  getAITags: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AITaggingResult>("cloudinary/ai/auto-tag", request);
      set({ lastTaggingResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to get AI tags") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/ai/content-moderation
  moderateContent: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<ModerationResult>(
        "cloudinary/ai/content-moderation",
        request
      );
      set({ lastModerationResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to moderate content") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/ai/background-removal
  removeBackground: async ({ public_id, resource_type = "image" }) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ public_id, resource_type });
      const res = await api.post<{ url: string }>(
        `cloudinary/ai/background-removal${qs}`
      );
      set({ lastUrl: res.data.url });
      return res.data.url;
    } catch (err) {
      set({ error: errMsg(err, "Failed to remove background") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/ai/object-detection
  detectObjects: async ({ public_id, resource_type = "image" }) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ public_id, resource_type });
      const res = await api.post<ObjectDetectionResult>(
        `cloudinary/ai/object-detection${qs}`
      );
      set({ lastDetectionResult: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to detect objects") });
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
      lastTaggingResult: null,
      lastModerationResult: null,
      lastDetectionResult: null,
      lastUrl: null,
    }),
}));
