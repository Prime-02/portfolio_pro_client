import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  ContentLikeCreate,
  ContentLikeResponse,
  ContentLikesListResponse,
  UserLikedResponse,
  ReactionCountsResponse,
  ReactionType,
} from "@/lib/stores/contents/types/content.types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ContentLikeState {
  // Per-content like lists (keyed by content_id)
  likesByContent: Record<string, ContentLikeResponse[]>;
  totalByContent: Record<string, number>;

  // Per-content user status (keyed by content_id)
  userLikedStatus: Record<string, UserLikedResponse>;

  // Per-content reaction counts (keyed by content_id)
  reactionCounts: Record<string, ReactionCountsResponse>;

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

interface ContentLikeActions {
  likeContent: (payload: ContentLikeCreate) => Promise<ContentLikeResponse>;
  unlikeContent: (contentId: string) => Promise<void>;
  fetchContentLikes: (contentId: string, page?: number, pageSize?: number) => Promise<void>;
  checkUserLiked: (contentId: string) => Promise<UserLikedResponse>;
  fetchReactionCounts: (contentId: string) => Promise<ReactionCountsResponse>;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useContentLikeStore = create<ContentLikeState & ContentLikeActions>(
  (set) => ({
    likesByContent: {},
    totalByContent: {},
    userLikedStatus: {},
    reactionCounts: {},
    isLoading: false,
    isSubmitting: false,
    error: null,

    likeContent: async (payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.post<ContentLikeResponse>("/content/likes/", payload);
        const like = response.data;

        // Update user liked status in cache
        set((state) => ({
          userLikedStatus: {
            ...state.userLikedStatus,
            [payload.content_id]: {
              liked: true,
              reaction_type: like.reaction_type as ReactionType,
            },
          },
        }));

        return like;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    unlikeContent: async (contentId) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.delete(`/content/likes/${contentId}`);

        set((state) => ({
          userLikedStatus: {
            ...state.userLikedStatus,
            [contentId]: { liked: false, reaction_type: null },
          },
          likesByContent: {
            ...state.likesByContent,
            [contentId]: (state.likesByContent[contentId] ?? []).filter(
              // Remove optimistically — full refetch happens on next open
              () => false
            ),
          },
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    fetchContentLikes: async (contentId, page = 1, pageSize = 20) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentLikesListResponse>(
          `/content/likes/${contentId}`,
          { params: { page, page_size: pageSize } }
        );
        set((state) => ({
          likesByContent: {
            ...state.likesByContent,
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

    checkUserLiked: async (contentId) => {
      try {
        const response = await api.get<UserLikedResponse>(
          `/content/likes/${contentId}/check`
        );
        set((state) => ({
          userLikedStatus: {
            ...state.userLikedStatus,
            [contentId]: response.data,
          },
        }));
        return response.data;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      }
    },

    fetchReactionCounts: async (contentId) => {
      try {
        const response = await api.get<ReactionCountsResponse>(
          `/content/likes/${contentId}/reactions`
        );
        set((state) => ({
          reactionCounts: {
            ...state.reactionCounts,
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
