import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  ContentViewCreate,
  ContentViewResponse,
  ContentAnalytics,
  EngagementMetrics,
  AudienceInsights,
  UserContentAnalytics,
} from "@/lib/stores/contents/types/content.types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ContentAnalyticsState {
  // Per-content analytics (keyed by content_id)
  analyticsByContent: Record<string, ContentAnalytics>;
  engagementByContent: Record<string, EngagementMetrics>;
  audienceByContent: Record<string, AudienceInsights>;

  // Per-user aggregate analytics (keyed by user_id, "me" for current user)
  userAnalytics: Record<string, UserContentAnalytics>;

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

interface ContentAnalyticsActions {
  trackView: (payload: ContentViewCreate) => Promise<ContentViewResponse>;
  fetchContentAnalytics: (
    contentId: string,
    dateFrom?: string,
    dateTo?: string
  ) => Promise<void>;
  fetchEngagementMetrics: (contentId: string) => Promise<void>;
  fetchAudienceInsights: (contentId: string) => Promise<void>;
  fetchUserAnalytics: (
    userId?: string,
    dateFrom?: string,
    dateTo?: string
  ) => Promise<void>;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useContentAnalyticsStore = create<
  ContentAnalyticsState & ContentAnalyticsActions
>((set) => ({
  analyticsByContent: {},
  engagementByContent: {},
  audienceByContent: {},
  userAnalytics: {},
  isLoading: false,
  isSubmitting: false,
  error: null,

  trackView: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await api.post<ContentViewResponse>(
        "/content/analytics/views",
        payload
      );
      return response.data;
    } catch (err: unknown) {
      set({ error: extractMessage(err) });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchContentAnalytics: async (contentId, dateFrom, dateTo) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ContentAnalytics>(
        `/content/analytics/${contentId}`,
        { params: { date_from: dateFrom, date_to: dateTo } }
      );
      set((state) => ({
        analyticsByContent: {
          ...state.analyticsByContent,
          [contentId]: response.data,
        },
      }));
    } catch (err: unknown) {
      set({ error: extractMessage(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEngagementMetrics: async (contentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<EngagementMetrics>(
        `/content/analytics/${contentId}/engagement`
      );
      set((state) => ({
        engagementByContent: {
          ...state.engagementByContent,
          [contentId]: response.data,
        },
      }));
    } catch (err: unknown) {
      set({ error: extractMessage(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAudienceInsights: async (contentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<AudienceInsights>(
        `/content/analytics/${contentId}/audience`
      );
      set((state) => ({
        audienceByContent: {
          ...state.audienceByContent,
          [contentId]: response.data,
        },
      }));
    } catch (err: unknown) {
      set({ error: extractMessage(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserAnalytics: async (userId, dateFrom, dateTo) => {
    set({ isLoading: true, error: null });
    try {
      const key = userId ?? "me";
      const url = userId
        ? `/content/analytics/user/${userId}`
        : "/content/analytics/user/me";
      const response = await api.get<UserContentAnalytics>(url, {
        params: { date_from: dateFrom, date_to: dateTo },
      });
      set((state) => ({
        userAnalytics: { ...state.userAnalytics, [key]: response.data },
      }));
    } catch (err: unknown) {
      set({ error: extractMessage(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

function extractMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { detail?: string; message?: string } } };
    return (
      axiosErr.response?.data?.detail ??
      axiosErr.response?.data?.message ??
      "An unexpected error occurred"
    );
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}
