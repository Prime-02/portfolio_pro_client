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
  fetchCommentThread: (
    commentId: string,
    page?: number,
    pageSize?: number,
  ) => Promise<void>;
  createComment: (
    payload: ContentCommentCreate,
  ) => Promise<ContentCommentWithUser>;
  updateComment: (
    commentId: string,
    payload: ContentCommentUpdate,
  ) => Promise<ContentCommentResponse>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// A comment can be cached in two places at once: as a top-level item in
// commentsByContent, and/or as a reply item in threadsByComment. Keep both
// in sync whenever a comment is edited, deleted, liked, or unliked.
function mapCommentEverywhere(
  commentsByContent: Record<string, ContentCommentWithUser[]>,
  threadsByComment: Record<string, ContentCommentWithUser[]>,
  commentId: string,
  updater: (comment: ContentCommentWithUser) => ContentCommentWithUser,
) {
  const nextCommentsByContent = Object.fromEntries(
    Object.entries(commentsByContent).map(([key, comments]) => [
      key,
      comments.map((c) => (c.id === commentId ? updater(c) : c)),
    ]),
  );
  const nextThreadsByComment = Object.fromEntries(
    Object.entries(threadsByComment).map(([key, replies]) => [
      key,
      replies.map((c) => (c.id === commentId ? updater(c) : c)),
    ]),
  );
  return { nextCommentsByContent, nextThreadsByComment };
}

// Recursively map through nested replies
function mapNestedReplies(
  replies: ContentCommentWithUser[],
  commentId: string,
  updater: (comment: ContentCommentWithUser) => ContentCommentWithUser,
): ContentCommentWithUser[] {
  return replies.map((reply) => {
    if (reply.id === commentId) {
      return updater(reply);
    }
    if (reply.replies && reply.replies.length > 0) {
      return {
        ...reply,
        replies: mapNestedReplies(reply.replies, commentId, updater),
      };
    }
    return reply;
  });
}

// Also update nested replies inside commentsByContent threads
function mapCommentEverywhereDeep(
  commentsByContent: Record<string, ContentCommentWithUser[]>,
  threadsByComment: Record<string, ContentCommentWithUser[]>,
  commentId: string,
  updater: (comment: ContentCommentWithUser) => ContentCommentWithUser,
) {
  const nextCommentsByContent = Object.fromEntries(
    Object.entries(commentsByContent).map(([key, comments]) => [
      key,
      comments.map((c) => {
        if (c.id === commentId) return updater(c);
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: mapNestedReplies(c.replies, commentId, updater),
          };
        }
        return c;
      }),
    ]),
  );
  const nextThreadsByComment = Object.fromEntries(
    Object.entries(threadsByComment).map(([key, replies]) => [
      key,
      mapNestedReplies(replies, commentId, updater),
    ]),
  );
  return { nextCommentsByContent, nextThreadsByComment };
}

// Remove a comment from all caches (hard delete)
function removeCommentEverywhere(
  commentsByContent: Record<string, ContentCommentWithUser[]>,
  threadsByComment: Record<string, ContentCommentWithUser[]>,
  commentId: string,
) {
  const nextCommentsByContent: Record<string, ContentCommentWithUser[]> = {};
  for (const [key, comments] of Object.entries(commentsByContent)) {
    nextCommentsByContent[key] = comments.filter((c) => c.id !== commentId);
  }

  const nextThreadsByComment: Record<string, ContentCommentWithUser[]> = {};
  for (const [key, replies] of Object.entries(threadsByComment)) {
    nextThreadsByComment[key] = replies.filter((c) => c.id !== commentId);
  }

  return { nextCommentsByContent, nextThreadsByComment };
}

export const useContentCommentStore = create<
  ContentCommentState & ContentCommentActions
>((set, get) => ({
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
      const response = await api.get<ContentCommentListResponse>(
        "/content/comments/",
        {
          params: filters,
        },
      );
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
        `/content/comments/${commentId}`,
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
        { params: { page, page_size: pageSize } },
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
    const key = payload.content_id;
    set({ isSubmitting: true, error: null });

    try {
      const response = await api.post<ContentCommentWithUser>(
        "/content/comments/",
        payload,
      );
      const serverComment = response.data;

      // Add the confirmed comment returned by the server
      set((state) => {
        if (payload.parent_comment_id) {
          const threadKey = payload.parent_comment_id;
          return {
            threadsByComment: {
              ...state.threadsByComment,
              [threadKey]: [
                serverComment,
                ...(state.threadsByComment[threadKey] ?? []),
              ],
            },
            // Also increment parent comment's replies_count in commentsByContent
            commentsByContent: Object.fromEntries(
              Object.entries(state.commentsByContent).map(([k, comments]) => [
                k,
                comments.map((c) =>
                  c.id === payload.parent_comment_id
                    ? { ...c, replies_count: c.replies_count + 1 }
                    : c,
                ),
              ]),
            ),
            totalByContent: {
              ...state.totalByContent,
              [key]: (state.totalByContent[key] ?? 0) + 1,
            },
          };
        }
        // Top-level comment
        return {
          commentsByContent: {
            ...state.commentsByContent,
            [key]: [serverComment, ...(state.commentsByContent[key] ?? [])],
          },
          totalByContent: {
            ...state.totalByContent,
            [key]: (state.totalByContent[key] ?? 0) + 1,
          },
        };
      });

      return serverComment;
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
        payload,
      );
      const updated = response.data;

      // Apply the confirmed update returned by the server
      set((state) => {
        const { nextCommentsByContent, nextThreadsByComment } =
          mapCommentEverywhereDeep(
            state.commentsByContent,
            state.threadsByComment,
            commentId,
            (c) => ({ ...c, ...updated }),
          );
        return {
          commentsByContent: nextCommentsByContent,
          threadsByComment: nextThreadsByComment,
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

  deleteComment: async (commentId) => {
    // Capture previous state for rollback
    const prevState = {
      commentsByContent: get().commentsByContent,
      threadsByComment: get().threadsByComment,
      totalByContent: get().totalByContent,
      threadTotalsByComment: get().threadTotalsByComment,
    };

    // Optimistically remove from all caches
    set((state) => {
      const { nextCommentsByContent, nextThreadsByComment } =
        removeCommentEverywhere(
          state.commentsByContent,
          state.threadsByComment,
          commentId,
        );

      // Decrement totals for affected content
      const nextTotalByContent = { ...state.totalByContent };
      for (const [key, comments] of Object.entries(state.commentsByContent)) {
        const hadComment = comments.some((c) => c.id === commentId);
        if (hadComment) {
          nextTotalByContent[key] = Math.max(
            0,
            (nextTotalByContent[key] ?? comments.length) - 1,
          );
        }
      }

      // Also drop any thread cache for this comment (if it was a root)
      const nextThreadTotals = { ...state.threadTotalsByComment };
      if (commentId in nextThreadTotals) {
        delete nextThreadTotals[commentId];
      }

      return {
        commentsByContent: nextCommentsByContent,
        threadsByComment: nextThreadsByComment,
        totalByContent: nextTotalByContent,
        threadTotalsByComment: nextThreadTotals,
        currentComment:
          state.currentComment?.id === commentId ? null : state.currentComment,
      };
    });

    try {
      await api.delete(`/content/comments/${commentId}`);
    } catch (err: unknown) {
      // Revert on failure
      set({
        ...prevState,
        error: extractMessage(err),
      });
      throw err;
    }
  },

  likeComment: async (commentId) => {
    const prevCommentsByContent = get().commentsByContent;
    const prevThreadsByComment = get().threadsByComment;

    // Optimistically update
    set((state) => {
      const { nextCommentsByContent, nextThreadsByComment } =
        mapCommentEverywhereDeep(
          state.commentsByContent,
          state.threadsByComment,
          commentId,
          (c) =>
            c.is_liked
              ? c
              : { ...c, is_liked: true, likes_count: c.likes_count + 1 },
        );
      return {
        commentsByContent: nextCommentsByContent,
        threadsByComment: nextThreadsByComment,
      };
    });

    try {
      await api.post(`/content/comments/${commentId}/like`);
    } catch (err: unknown) {
      set({
        commentsByContent: prevCommentsByContent,
        threadsByComment: prevThreadsByComment,
        error: extractMessage(err),
      });
      throw err;
    }
  },

  unlikeComment: async (commentId) => {
    const prevCommentsByContent = get().commentsByContent;
    const prevThreadsByComment = get().threadsByComment;

    // Optimistically update
    set((state) => {
      const { nextCommentsByContent, nextThreadsByComment } =
        mapCommentEverywhereDeep(
          state.commentsByContent,
          state.threadsByComment,
          commentId,
          (c) =>
            c.is_liked
              ? {
                  ...c,
                  is_liked: false,
                  likes_count: Math.max(0, c.likes_count - 1),
                }
              : c,
        );
      return {
        commentsByContent: nextCommentsByContent,
        threadsByComment: nextThreadsByComment,
      };
    });

    try {
      await api.delete(`/content/comments/${commentId}/like`);
    } catch (err: unknown) {
      set({
        commentsByContent: prevCommentsByContent,
        threadsByComment: prevThreadsByComment,
        error: extractMessage(err),
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

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
