import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  ContentTagCreate,
  ContentTagUpdate,
  ContentTagResponse,
  ContentTagListResponse,
  TrendingTagsResponse,
  TrendingPeriod,
} from "@/lib/stores/contents/types/content.types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ContentTagState {
  tags: ContentTagResponse[];
  total: number;
  trendingTags: ContentTagResponse[];
  trendingPeriod: TrendingPeriod;
  suggestions: ContentTagResponse[];
  currentTag: ContentTagResponse | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

interface ContentTagActions {
  fetchTags: (filters?: {
    search?: string;
    is_trending?: boolean;
    page?: number;
    page_size?: number;
  }) => Promise<void>;
  fetchTagById: (tagId: string) => Promise<void>;
  fetchTagByName: (tagName: string) => Promise<void>;
  fetchTrendingTags: (period?: TrendingPeriod, limit?: number) => Promise<void>;
  suggestTags: (query: string, limit?: number) => Promise<void>;
  getTagContentCount: (tagName: string) => Promise<number>;
  createTag: (payload: ContentTagCreate) => Promise<ContentTagResponse>;
  updateTag: (tagId: string, payload: ContentTagUpdate) => Promise<ContentTagResponse>;
  deleteTag: (tagId: string) => Promise<void>;
  mergeTags: (sourceTagId: string, targetTagId: string) => Promise<ContentTagResponse>;
  updateUsageCounts: () => Promise<void>;
  clearSuggestions: () => void;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useContentTagStore = create<ContentTagState & ContentTagActions>(
  (set, get) => ({
    tags: [],
    total: 0,
    trendingTags: [],
    trendingPeriod: "last_7_days",
    suggestions: [],
    currentTag: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchTags: async (filters = {}) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentTagListResponse>("/content/tags/", {
          params: filters,
        });
        console.log(JSON.stringify(response.data))
        set({ tags: response.data.items, total: response.data.total });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchTagById: async (tagId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentTagResponse>(`/content/tags/${tagId}`);
        set({ currentTag: response.data });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchTagByName: async (tagName) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentTagResponse>(
          `/content/tags/name/${tagName}`
        );
        set({ currentTag: response.data });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchTrendingTags: async (period = "last_7_days", limit = 20) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<TrendingTagsResponse>(
          "/content/tags/trending/list",
          { params: { period, limit } }
        );
        set({
          trendingTags: response.data.trending_tags,
          trendingPeriod: period,
        });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    suggestTags: async (query, limit = 10) => {
      try {
        const response = await api.get<{ query: string; suggestions: ContentTagResponse[] }>(
          "/content/tags/suggest/search",
          { params: { query, limit } }
        );
        set({ suggestions: response.data.suggestions });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      }
    },

    getTagContentCount: async (tagName) => {
      try {
        const response = await api.get<{ tag_name: string; content_count: number }>(
          `/content/tags/${tagName}/count`
        );
        return response.data.content_count;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      }
    },

    createTag: async (payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.post<ContentTagResponse>("/content/tags/", payload);
        const tag = response.data;
        set((state) => ({
          tags: [tag, ...state.tags],
          total: state.total + 1,
        }));
        return tag;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    updateTag: async (tagId, payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.put<ContentTagResponse>(
          `/content/tags/${tagId}`,
          payload
        );
        const updated = response.data;
        set((state) => ({
          tags: state.tags.map((t) => (t.id === tagId ? updated : t)),
          currentTag: state.currentTag?.id === tagId ? updated : state.currentTag,
        }));
        return updated;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    deleteTag: async (tagId) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.delete(`/content/tags/${tagId}`);
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== tagId),
          total: Math.max(0, state.total - 1),
          currentTag: state.currentTag?.id === tagId ? null : state.currentTag,
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    mergeTags: async (sourceTagId, targetTagId) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.post<ContentTagResponse>("/content/tags/admin/merge", null, {
          params: { source_tag_id: sourceTagId, target_tag_id: targetTagId },
        });
        const merged = response.data;
        // Remove source tag and update target tag in local state
        set((state) => ({
          tags: state.tags
            .filter((t) => t.id !== sourceTagId)
            .map((t) => (t.id === targetTagId ? merged : t)),
          total: Math.max(0, state.total - 1),
        }));
        return merged;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    updateUsageCounts: async () => {
      set({ isSubmitting: true, error: null });
      try {
        await api.post("/content/tags/admin/update-counts");
        // Refetch to get updated counts
        await get().fetchTags();
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    clearSuggestions: () => set({ suggestions: [] }),
    clearError: () => set({ error: null }),
  })
);

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
