import { create } from "zustand";
import { api } from "@/lib/client/api";
import type { CloudinarySliceState, ResourceType } from "./types";

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface TransformationUsageResult {
  message: string;
  resource_type: string;
  start_date: string | null;
  end_date: string | null;
  [key: string]: unknown;
}

export interface BandwidthUsageResult {
  bandwidth: Record<string, unknown>;
  period: { start: string | null; end: string | null };
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CloudinaryAnalyticsState extends CloudinarySliceState {
  transformationUsage: TransformationUsageResult | null;
  bandwidthUsage: BandwidthUsageResult | null;

  // Actions — mirrors /cloudinary/analytics/*
  getTransformationUsage: (params?: TransformationUsageParams) => Promise<TransformationUsageResult>;
  getBandwidthUsage: (params?: DateRangeParams) => Promise<BandwidthUsageResult>;

  clearError: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Param types
// ---------------------------------------------------------------------------

export interface TransformationUsageParams extends DateRangeParams {
  resource_type?: ResourceType;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
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

export const useCloudinaryAnalytics = create<CloudinaryAnalyticsState>()((set) => ({
  isLoading: false,
  error: null,
  transformationUsage: null,
  bandwidthUsage: null,

  // GET /cloudinary/analytics/transformation-usage
  getTransformationUsage: async ({
    resource_type = "image",
    start_date,
    end_date,
  }: TransformationUsageParams = {}) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ resource_type, start_date, end_date });
      const res = await api.get<TransformationUsageResult>(
        `cloudinary/analytics/transformation-usage${qs}`
      );
      set({ transformationUsage: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to fetch transformation usage") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/analytics/bandwidth-usage
  getBandwidthUsage: async ({ start_date, end_date }: DateRangeParams = {}) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ start_date, end_date });
      const res = await api.get<BandwidthUsageResult>(
        `cloudinary/analytics/bandwidth-usage${qs}`
      );
      set({ bandwidthUsage: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to fetch bandwidth usage") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({ isLoading: false, error: null, transformationUsage: null, bandwidthUsage: null }),
}));
