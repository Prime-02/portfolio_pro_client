import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  ContentShareCreate,
  ContentShareResponse,
  ContentShareWithContent,
  ContentSharesListResponse,
  UserSharedResponse,
} from "@/lib/stores/contents/types/content.types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ContentShareState {
  // Shares keyed by content_id
  sharesByContent: Record<string, ContentShareWithContent[]>;
  totalByContent: Record<string, number>;

  // User shares list
  userShares: ContentShareWithContent[];
  userSharesTotal: number;

  // Per-content user share status
  userSharedStatus: Record<string, UserSharedResponse>;

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

interface ContentShareActions {
  shareContent: (payload: ContentShareCreate) => Promise<ContentShareResponse>;
  unshareContent: (shareId: string, contentId: string) => Promise<void>;
  fetchContentShares: (contentId: string, page?: number, pageSize?: number) => Promise<void>;
  fetchUserShares: (userId?: string, page?: number, pageSize?: number) => Promise<void>;
  checkUserShared: (contentId: string) => Promise<UserSharedResponse>;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useContentShareStore = create<ContentShareState & ContentShareActions>(
  (set) => ({
    sharesByContent: {},
    totalByContent: {},
    userShares: [],
    userSharesTotal: 0,
    userSharedStatus: {},
    isLoading: false,
    isSubmitting: false,
    error: null,

    shareContent: async (payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.post<ContentShareResponse>("/content/shares/", payload);
        const share = response.data;
        const key = payload.original_content_id;

        set((state) => ({
          userSharedStatus: {
            ...state.userSharedStatus,
            [key]: { shared: true, share_id: share.id },
          },
          userShares: [{ ...share, original_content: null, shared_by: null }, ...state.userShares],
          userSharesTotal: state.userSharesTotal + 1,
        }));

        return share;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    unshareContent: async (shareId, contentId) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.delete(`/content/shares/${shareId}`);

        set((state) => ({
          userSharedStatus: {
            ...state.userSharedStatus,
            [contentId]: { shared: false, share_id: null },
          },
          sharesByContent: {
            ...state.sharesByContent,
            [contentId]: (state.sharesByContent[contentId] ?? []).filter(
              (s) => s.id !== shareId
            ),
          },
          userShares: state.userShares.filter((s) => s.id !== shareId),
          userSharesTotal: Math.max(0, state.userSharesTotal - 1),
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    fetchContentShares: async (contentId, page = 1, pageSize = 20) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentSharesListResponse>(
          `/content/shares/content/${contentId}`,
          { params: { page, page_size: pageSize } }
        );
        set((state) => ({
          sharesByContent: {
            ...state.sharesByContent,
            [contentId]: response.data.items,
          },
          totalByContent: {
            ...state.totalByContent,
            [contentId]: response.data.total,
          },
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchUserShares: async (userId, page = 1, pageSize = 20) => {
      set({ isLoading: true, error: null });
      try {
        const url = userId
          ? `/content/shares/user/${userId}`
          : "/content/shares/user/me";
        const response = await api.get<ContentSharesListResponse>(url, {
          params: { page, page_size: pageSize },
        });
        set({
          userShares: response.data.items,
          userSharesTotal: response.data.total,
        });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    checkUserShared: async (contentId) => {
      try {
        const response = await api.get<UserSharedResponse>(
          `/content/shares/${contentId}/check`
        );
        set((state) => ({
          userSharedStatus: {
            ...state.userSharedStatus,
            [contentId]: response.data,
          },
        }));
        return response.data;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      }
    },

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
