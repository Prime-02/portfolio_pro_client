import { create } from "zustand";
import { api } from "@/lib/client/api";
import { buildFormData } from "@/lib/client/api";
import type {
  ContentResponse,
  ContentWithAuthor,
  ContentListResponse,
  ContentCreatePayload,
  ContentUpdatePayload,
  ContentFilterParams,
  BulkContentUpdate,
  BulkDeleteRequest,
  BulkOperationResponse,
} from "@/lib/stores/contents/types/content.types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ContentState {
  // Authenticated list
  items: ContentWithAuthor[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  activeFilters: ContentFilterParams;

  // Public list
  publicItems: ContentWithAuthor[];
  publicTotal: number;
  publicPage: number;
  publicPageSize: number;
  publicHasNext: boolean;
  publicActiveFilters: ContentFilterParams;

  // Single item
  currentContent: ContentWithAuthor | null;

  // UI
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

interface ContentActions {
  // Authenticated CRUD
  fetchContent: (filters?: ContentFilterParams) => Promise<void>;
  fetchContentById: (id: string) => Promise<void>;
  fetchContentBySlug: (slug: string) => Promise<void>;
  fetchUserContent: (
    username: string,
    filters?: ContentFilterParams,
  ) => Promise<void>;
  createContent: (payload: ContentCreatePayload) => Promise<ContentResponse>;
  updateContent: (
    id: string,
    payload: ContentUpdatePayload,
  ) => Promise<ContentResponse>;
  deleteContent: (id: string, hardDelete?: boolean) => Promise<void>;

  // Publishing
  publishContent: (id: string) => Promise<ContentResponse>;

  // Bulk
  bulkUpdateContent: (
    payload: BulkContentUpdate,
  ) => Promise<BulkOperationResponse>;
  bulkDeleteContent: (payload: BulkDeleteRequest) => Promise<void>;

  // Public (no auth)
  fetchPublicContent: (filters?: ContentFilterParams) => Promise<void>;
  fetchPublicContentById: (id: string) => Promise<void>;
  fetchPublicContentBySlug: (slug: string) => Promise<void>;
  fetchPublicUserContent: (
    username: string,
    filters?: ContentFilterParams,
  ) => Promise<void>;

  // Pagination helpers
  setPage: (page: number) => void;
  setPublicPage: (page: number) => void;
  setFilters: (filters: ContentFilterParams) => void;
  setPublicFilters: (filters: ContentFilterParams) => void;

  // Reset
  clearCurrentContent: () => void;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useContentStore = create<ContentState & ContentActions>(
  (set, get) => ({
    // ---- initial state (authenticated) ----
    items: [],
    total: 0,
    page: 1,
    page_size: 20,
    has_next: false,
    activeFilters: {},
    currentContent: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    // ---- initial state (public) ----
    publicItems: [],
    publicTotal: 0,
    publicPage: 1,
    publicPageSize: 20,
    publicHasNext: false,
    publicActiveFilters: {},

    // ---- authenticated list ----
    fetchContent: async (filters = {}) => {
      set({ isLoading: true, error: null });
      try {
        const params = { ...get().activeFilters, ...filters };
        const response = await api.get<ContentListResponse>("/content/core/", {
          params,
        });
        const { items, total, page, page_size, has_next } = response.data;

        // Append when loading page > 1 (infinite scroll); replace otherwise
        set((state) => ({
          items: page > 1 ? dedupeAppend(state.items, items) : items,
          total,
          page,
          page_size,
          has_next,
          activeFilters: params,
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchContentById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentWithAuthor>(
          `/content/core/${id}`,
        );
        set({ currentContent: response.data });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchContentBySlug: async (slug) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentWithAuthor>(
          `/content/core/slug/${slug}`,
        );
        set({ currentContent: response.data });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchUserContent: async (username, filters = {}) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentListResponse>(
          `/content/core/user/${username}`,
          { params: filters },
        );
        const { items, total, page, page_size, has_next } = response.data;
        set((state) => ({
          items: page > 1 ? dedupeAppend(state.items, items) : items,
          total,
          page,
          page_size,
          has_next,
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    // ---- public list ----
    fetchPublicContent: async (filters = {}) => {
      set({ isLoading: true, error: null });
      try {
        const params = { ...get().publicActiveFilters, ...filters };
        const response = await api.get<ContentListResponse>("/content/core/", {
          params,
        });
        const { items, total, page, page_size, has_next } = response.data;
        set((state) => ({
          publicItems:
            page > 1 ? dedupeAppend(state.publicItems, items) : items,
          publicTotal: total,
          publicPage: page,
          publicPageSize: page_size,
          publicHasNext: has_next,
          publicActiveFilters: params,
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchPublicContentById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentWithAuthor>(
          `/content/core/public/${id}`,
        );
        set({ currentContent: response.data });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchPublicContentBySlug: async (slug) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentWithAuthor>(
          `/content/core/public/slug/${slug}`,
        );
        set({ currentContent: response.data });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchPublicUserContent: async (username, filters = {}) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentListResponse>(
          `/content/core/public/user/${username}`,
          { params: filters },
        );
        const { items, total, page, page_size, has_next } = response.data;
        set((state) => ({
          publicItems:
            page > 1 ? dedupeAppend(state.publicItems, items) : items,
          publicTotal: total,
          publicPage: page,
          publicPageSize: page_size,
          publicHasNext: has_next,
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    // ---- create ----
    createContent: async (payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const formData = buildFormData(
          payload as unknown as Record<string, unknown>,
        );
        const response = await api.post<ContentResponse>(
          "/content/core/",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        set((state) => ({
          items: [{ ...response.data, author: null, reaction_type: "LIKE" }, ...state.items],
          total: state.total + 1,
        }));
        return response.data;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    // ---- update ----
    updateContent: async (id, payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const formData = buildFormData(
          payload as unknown as Record<string, unknown>,
        );
        const response = await api.put<ContentResponse>(
          `/content/core/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...response.data } : item,
          ),
          currentContent:
            state.currentContent?.id === id
              ? { ...state.currentContent, ...response.data }
              : state.currentContent,
        }));
        return response.data;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    // ---- delete ----
    deleteContent: async (id, hardDelete = true) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.delete(`/content/core/${id}`, {
          params: { hard_delete: hardDelete },
        });
        set((state) => ({
          // Remove from authenticated items
          items: state.items.filter((item) => item.id !== id),
          total: state.total - 1,

          // Remove from public items if present
          publicItems: state.publicItems.filter((item) => item.id !== id),
          publicTotal: state.publicItems.some((item) => item.id === id)
            ? state.publicTotal - 1
            : state.publicTotal,

          // Clear current content if it's the deleted one
          currentContent:
            state.currentContent?.id === id ? null : state.currentContent,
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    // ---- publish ----
    publishContent: async (id) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.post<ContentResponse>(
          `/content/core/${id}/publish`,
        );
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...response.data } : item,
          ),
          currentContent:
            state.currentContent?.id === id
              ? { ...state.currentContent, ...response.data }
              : state.currentContent,
        }));
        return response.data;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    // ---- bulk ----
    bulkUpdateContent: async (payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.post<BulkOperationResponse>(
          "/content/core/bulk-update",
          payload,
        );
        await get().fetchContent(get().activeFilters);
        return response.data;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    bulkDeleteContent: async (payload) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.delete("/content/core/bulk-delete", { data: payload });
        await get().fetchContent(get().activeFilters);
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    // ---- pagination / filters (authenticated) ----
    setPage: (page) => {
      set({ page });
      get().fetchContent({ ...get().activeFilters, page });
    },

    setFilters: (filters) => {
      set({ activeFilters: filters, page: 1 });
      get().fetchContent({ ...filters, page: 1 });
    },

    // ---- pagination / filters (public) ----
    setPublicPage: (page) => {
      set({ publicPage: page });
      get().fetchPublicContent({ ...get().publicActiveFilters, page });
    },

    setPublicFilters: (filters) => {
      set({ publicActiveFilters: filters, publicPage: 1 });
      get().fetchPublicContent({ ...filters, page: 1 });
    },

    // ---- reset ----
    clearCurrentContent: () => set({ currentContent: null }),
    clearError: () => set({ error: null }),
  }),
);

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function extractMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as {
      response?: { data?: { detail?: string; message?: string } };
    };
    return (
      axiosErr.response?.data?.detail ??
      axiosErr.response?.data?.message ??
      "An unexpected error occurred"
    );
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

/** Append incoming items, skipping any already present by id */
function dedupeAppend(
  existing: ContentWithAuthor[],
  incoming: ContentWithAuthor[],
): ContentWithAuthor[] {
  const existingIds = new Set(existing.map((i) => i.id));
  return [...existing, ...incoming.filter((i) => !existingIds.has(i.id))];
}
