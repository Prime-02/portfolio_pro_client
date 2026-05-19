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
  // List
  items: ContentWithAuthor[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  activeFilters: ContentFilterParams;

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
  // CRUD
  fetchContent: (filters?: ContentFilterParams) => Promise<void>;
  fetchContentById: (id: string) => Promise<void>;
  fetchContentBySlug: (slug: string) => Promise<void>;
  fetchUserContent: (
    username: string,
    filters?: Pick<ContentFilterParams, "content_type" | "status" | "page" | "page_size">
  ) => Promise<void>;
  createContent: (payload: ContentCreatePayload) => Promise<ContentResponse>;
  updateContent: (id: string, payload: ContentUpdatePayload) => Promise<ContentResponse>;
  deleteContent: (id: string, hardDelete?: boolean) => Promise<void>;

  // Publishing
  publishContent: (id: string) => Promise<ContentResponse>;

  // Bulk
  bulkUpdateContent: (payload: BulkContentUpdate) => Promise<BulkOperationResponse>;
  bulkDeleteContent: (payload: BulkDeleteRequest) => Promise<void>;

  // Pagination helpers
  setPage: (page: number) => void;
  setFilters: (filters: ContentFilterParams) => void;

  // Reset
  clearCurrentContent: () => void;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useContentStore = create<ContentState & ContentActions>((set, get) => ({
  // ---- initial state ----
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

  // ---- list ----
  fetchContent: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = { ...get().activeFilters, ...filters };
      const response = await api.get<ContentListResponse>("/content/core/", { params });
      const { items, total, page, page_size, has_next } = response.data;
      set({ items, total, page, page_size, has_next, activeFilters: params });
    } catch (err: unknown) {
      set({ error: extractMessage(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchContentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ContentWithAuthor>(`/content/core/${id}`);
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
      const response = await api.get<ContentWithAuthor>(`/content/core/slug/${slug}`);
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
        { params: filters }
      );
      const { items, total, page, page_size, has_next } = response.data;
      set({ items, total, page, page_size, has_next });
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
        payload as unknown as Record<string, unknown>
      );
      const response = await api.post<ContentResponse>("/content/core/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Optimistically prepend to list
      set((state) => ({
        items: [{ ...response.data, author: null }, ...state.items],
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
        payload as unknown as Record<string, unknown>
      );
      const response = await api.put<ContentResponse>(`/content/core/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Update in list and currentContent
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...response.data } : item
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
      await api.delete(`/content/core/${id}`, { params: { hard_delete: hardDelete } });
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        total: state.total - 1,
        currentContent: state.currentContent?.id === id ? null : state.currentContent,
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
      const response = await api.post<ContentResponse>(`/content/core/${id}/publish`);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...response.data } : item
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
        payload
      );
      // Refetch to reflect updated state
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

  // ---- pagination / filters ----
  setPage: (page) => {
    set({ page });
    get().fetchContent({ ...get().activeFilters, page });
  },

  setFilters: (filters) => {
    set({ activeFilters: filters, page: 1 });
    get().fetchContent({ ...filters, page: 1 });
  },

  // ---- reset ----
  clearCurrentContent: () => set({ currentContent: null }),
  clearError: () => set({ error: null }),
}));

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

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
