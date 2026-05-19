import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  ContentCommentCreate,
  ContentCommentUpdate,
  ContentCommentResponse,
  ContentCommentWithUser,
  ContentCommentListResponse,
  CommentFilterParams,
} from "@/lib/stores/contents/types/content.types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ContentCommentState {
  // Comments keyed by content_id for list views
  commentsByContent: Record<string, ContentCommentWithUser[]>;
  totalByContent: Record<string, number>;

  // Thread replies keyed by root comment_id
  threadsByComment: Record<string, ContentCommentWithUser[]>;
  threadTotalsByComment: Record<string, number>;

  // Single comment
  currentComment: ContentCommentWithUser | null;

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

interface ContentCommentActions {
  fetchComments: (filters: CommentFilterParams) => Promise<void>;
  fetchCommentById: (commentId: string) => Promise<void>;
  fetchCommentThread: (commentId: string, page?: number, pageSize?: number) => Promise<void>;
  createComment: (payload: ContentCommentCreate) => Promise<ContentCommentResponse>;
  updateComment: (commentId: string, payload: ContentCommentUpdate) => Promise<ContentCommentResponse>;
  deleteComment: (commentId: string, hardDelete?: boolean) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useContentCommentStore = create<ContentCommentState & ContentCommentActions>(
  (set) => ({
    commentsByContent: {},
    totalByContent: {},
    threadsByComment: {},
    threadTotalsByComment: {},
    currentComment: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchComments: async (filters) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentCommentListResponse>("/content/comments/", {
          params: filters,
        });
        const { items, total } = response.data;
        const key = filters.content_id ?? "all";
        set((state) => ({
          commentsByContent: { ...state.commentsByContent, [key]: items },
          totalByContent: { ...state.totalByContent, [key]: total },
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchCommentById: async (commentId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentCommentWithUser>(
          `/content/comments/${commentId}`
        );
        set({ currentComment: response.data });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchCommentThread: async (commentId, page = 1, pageSize = 20) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentCommentListResponse>(
          `/content/comments/${commentId}/thread`,
          { params: { page, page_size: pageSize } }
        );
        set((state) => ({
          threadsByComment: {
            ...state.threadsByComment,
            [commentId]: response.data.items,
          },
          threadTotalsByComment: {
            ...state.threadTotalsByComment,
            [commentId]: response.data.total,
          },
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    createComment: async (payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.post<ContentCommentResponse>(
          "/content/comments/",
          payload
        );
        const comment = response.data;
        const key = payload.content_id;

        // Optimistically prepend to the content's comment list
        set((state) => ({
          commentsByContent: {
            ...state.commentsByContent,
            [key]: [
              { ...comment, user: null, replies: [] },
              ...(state.commentsByContent[key] ?? []),
            ],
          },
          totalByContent: {
            ...state.totalByContent,
            [key]: (state.totalByContent[key] ?? 0) + 1,
          },
        }));

        return comment;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    updateComment: async (commentId, payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.put<ContentCommentResponse>(
          `/content/comments/${commentId}`,
          payload
        );
        const updated = response.data;

        // Update in all cached lists
        set((state) => {
          const updatedByContent = Object.fromEntries(
            Object.entries(state.commentsByContent).map(([key, comments]) => [
              key,
              comments.map((c) => (c.id === commentId ? { ...c, ...updated } : c)),
            ])
          );
          return {
            commentsByContent: updatedByContent,
            currentComment:
              state.currentComment?.id === commentId
                ? { ...state.currentComment, ...updated }
                : state.currentComment,
          };
        });

        return updated;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    deleteComment: async (commentId, hardDelete = false) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.delete(`/content/comments/${commentId}`, {
          params: { hard_delete: hardDelete },
        });

        set((state) => {
          const updatedByContent = Object.fromEntries(
            Object.entries(state.commentsByContent).map(([key, comments]) => [
              key,
              hardDelete
                ? comments.filter((c) => c.id !== commentId)
                : comments.map((c) =>
                    c.id === commentId ? { ...c, is_deleted: true, body: "[Comment deleted]" } : c
                  ),
            ])
          );
          return {
            commentsByContent: updatedByContent,
            currentComment:
              state.currentComment?.id === commentId ? null : state.currentComment,
          };
        });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    likeComment: async (commentId) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.post(`/content/comments/${commentId}/like`);
        // Optimistically increment likes_count
        set((state) => {
          const updatedByContent = Object.fromEntries(
            Object.entries(state.commentsByContent).map(([key, comments]) => [
              key,
              comments.map((c) =>
                c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c
              ),
            ])
          );
          return { commentsByContent: updatedByContent };
        });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    unlikeComment: async (commentId) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.delete(`/content/comments/${commentId}/like`);
        set((state) => {
          const updatedByContent = Object.fromEntries(
            Object.entries(state.commentsByContent).map(([key, comments]) => [
              key,
              comments.map((c) =>
                c.id === commentId
                  ? { ...c, likes_count: Math.max(0, c.likes_count - 1) }
                  : c
              ),
            ])
          );
          return { commentsByContent: updatedByContent };
        });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
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
