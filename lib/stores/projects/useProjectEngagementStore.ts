import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/client/api";
import type {
  ProjectComment,
  ProjectCommentCreate,
  ProjectCommentUpdate,
  CommentThread,
  PaginatedLikes,
  PaginatedUserLikes,
  PaginatedComments,
  PaginatedUserComments,
  ProjectEngagementStats,
  FullProjectEngagement,
  UserEngagementStats,
  LoadingState,
  ErrorState,
} from "./types/project.types";

// ============================================================
// STATE & ACTIONS INTERFACE
// ============================================================

interface ProjectEngagementState {
  // Likes
  likesByProject: Record<string, PaginatedLikes["likes"]>;
  likesTotalByProject: Record<string, number>;
  userLikedByProject: Record<string, boolean>;

  userLikes: PaginatedUserLikes["likes"];
  totalUserLikes: number;

  // Comments
  commentsByProject: Record<string, ProjectComment[]>;
  commentsTotalByProject: Record<string, number>;

  commentThread: CommentThread | null;
  repliesByComment: Record<string, ProjectComment[]>;
  repliesTotalByComment: Record<string, number>;

  userComments: PaginatedUserComments["comments"];
  totalUserComments: number;

  // Engagement stats
  engagementStatsByProject: Record<string, ProjectEngagementStats>;
  fullEngagementByProject: Record<string, FullProjectEngagement>;
  userEngagementStats: UserEngagementStats | null;

  // Loading & error
  loading: LoadingState;
  errors: ErrorState;

  // ── Like Actions ──────────────────────────────────────────
  toggleLike: (projectId: string) => Promise<void>;

  fetchProjectLikes: (
    projectId: string,
    params?: { page?: number; size?: number },
  ) => Promise<void>;

  fetchUserLikes: (
    userId: string,
    params?: { page?: number; size?: number },
  ) => Promise<void>;

  checkUserLiked: (projectId: string) => Promise<void>;

  // ── Comment Actions ───────────────────────────────────────
  fetchProjectComments: (
    projectId: string,
    params?: {
      page?: number;
      size?: number;
      sort_by?: string;
      sort_order?: "asc" | "desc";
    },
  ) => Promise<void>;

  fetchCommentReplies: (
    commentId: string,
    params?: { page?: number; size?: number },
  ) => Promise<void>;

  fetchCommentThread: (commentId: string) => Promise<void>;

  fetchUserComments: (
    userId: string,
    params?: { page?: number; size?: number },
  ) => Promise<void>;

  addComment: (
    projectId: string,
    data: ProjectCommentCreate,
  ) => Promise<ProjectComment | null>;

  updateComment: (
    commentId: string,
    data: ProjectCommentUpdate,
  ) => Promise<boolean>;

  deleteComment: (commentId: string) => Promise<boolean>;

  // ── Engagement Stat Actions ───────────────────────────────
  fetchEngagementStats: (projectId: string) => Promise<void>;
  fetchFullEngagement: (
    projectId: string,
    params?: { likes_limit?: number; comments_limit?: number },
  ) => Promise<void>;
  fetchUserEngagementStats: (userId: string) => Promise<void>;

  // ── Helpers ───────────────────────────────────────────────
  clearProjectEngagement: (projectId?: string) => void;
  clearErrors: () => void;
}

// ============================================================
// STORE
// ============================================================

export const useProjectEngagementStore = create<ProjectEngagementState>()(
  devtools(
    (set) => ({
      // ── Initial state ──────────────────────────────────────
      likesByProject: {},
      likesTotalByProject: {},
      userLikedByProject: {},
      userLikes: [],
      totalUserLikes: 0,

      commentsByProject: {},
      commentsTotalByProject: {},
      commentThread: null,
      repliesByComment: {},
      repliesTotalByComment: {},
      userComments: [],
      totalUserComments: 0,

      engagementStatsByProject: {},
      fullEngagementByProject: {},
      userEngagementStats: null,

      loading: {},
      errors: {},

      // ── Helpers ────────────────────────────────────────────
      clearErrors: () => set({ errors: {} }),

      clearProjectEngagement: (projectId) => {
        if (projectId) {
          set((s) => {
            const likesByProject = { ...s.likesByProject };
            const likesTotalByProject = { ...s.likesTotalByProject };
            const userLikedByProject = { ...s.userLikedByProject };
            const commentsByProject = { ...s.commentsByProject };
            const commentsTotalByProject = { ...s.commentsTotalByProject };
            const engagementStatsByProject = { ...s.engagementStatsByProject };
            const fullEngagementByProject = { ...s.fullEngagementByProject };

            delete likesByProject[projectId];
            delete likesTotalByProject[projectId];
            delete userLikedByProject[projectId];
            delete commentsByProject[projectId];
            delete commentsTotalByProject[projectId];
            delete engagementStatsByProject[projectId];
            delete fullEngagementByProject[projectId];

            return {
              likesByProject,
              likesTotalByProject,
              userLikedByProject,
              commentsByProject,
              commentsTotalByProject,
              engagementStatsByProject,
              fullEngagementByProject,
            };
          });
        } else {
          set({
            likesByProject: {},
            likesTotalByProject: {},
            userLikedByProject: {},
            commentsByProject: {},
            commentsTotalByProject: {},
            engagementStatsByProject: {},
            fullEngagementByProject: {},
          });
        }
      },

      // ── POST /projects/{project_id}/like ───────────────────
      toggleLike: async (projectId) => {
        set((s) => ({
          loading: { ...s.loading, toggleLike: true },
          errors: { ...s.errors, toggleLike: null },
        }));
        try {
          const { data } = await api.post<{
            message: string;
            is_liked: boolean;
            likes_count: number;
          }>(`/projects/${projectId}/like`, {});

          set((s) => {
            // Keep likesByProject list in sync: drop or add the current user's
            // entry so avatar lists don't go stale between full re-fetches.
            const existingLikes = s.likesByProject[projectId] ?? [];
            const updatedLikes = data.is_liked
              ? // Liked: the server is the source of truth for the full like
                // object, so we can't reconstruct it here without the user
                // profile. Leave the list as-is — it will be refreshed on the
                // next fetchProjectLikes call. We only prune on unlike below.
                existingLikes
              : // Unliked: remove any entry belonging to the acting user.
                existingLikes.filter(
                  (l) =>
                    !s.userLikedByProject[projectId] ||
                    l.user_id !==
                      Object.keys(s.userLikedByProject).find(
                        (k) => k === projectId,
                      ),
                );

            return {
              userLikedByProject: {
                ...s.userLikedByProject,
                [projectId]: data.is_liked,
              },
              likesTotalByProject: {
                ...s.likesTotalByProject,
                [projectId]: data.likes_count,
              },
              likesByProject: {
                ...s.likesByProject,
                [projectId]: updatedLikes,
              },
              // Keep engagement stats in sync
              engagementStatsByProject: s.engagementStatsByProject[projectId]
                ? {
                    ...s.engagementStatsByProject,
                    [projectId]: {
                      ...s.engagementStatsByProject[projectId],
                      likes_count: data.likes_count,
                      total_engagement:
                        s.engagementStatsByProject[projectId].total_engagement +
                        (data.is_liked ? 1 : -1),
                    },
                  }
                : s.engagementStatsByProject,
            };
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to toggle like";
          set((s) => ({ errors: { ...s.errors, toggleLike: message } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, toggleLike: false } }));
        }
      },

      // ── GET /projects/{project_id}/likes ───────────────────
      fetchProjectLikes: async (projectId, params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchLikes: true },
          errors: { ...s.errors, fetchLikes: null },
        }));
        try {
          const query = new URLSearchParams();
          if (params.page) query.set("page", String(params.page));
          if (params.size) query.set("size", String(params.size));

          const { data } = await api.get<PaginatedLikes>(
            `/projects/${projectId}/likes?${query.toString()}`,
          );

          set((s) => ({
            likesByProject: { ...s.likesByProject, [projectId]: data.likes },
            likesTotalByProject: {
              ...s.likesTotalByProject,
              [projectId]: data.total,
            },
            userLikedByProject: {
              ...s.userLikedByProject,
              [projectId]:
                data.user_liked ?? s.userLikedByProject[projectId] ?? false,
            },
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch likes";
          set((s) => ({ errors: { ...s.errors, fetchLikes: message } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, fetchLikes: false } }));
        }
      },

      // ── GET /projects/users/{user_id}/likes ────────────────
      fetchUserLikes: async (userId, params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchUserLikes: true },
          errors: { ...s.errors, fetchUserLikes: null },
        }));
        try {
          const query = new URLSearchParams();
          if (params.page) query.set("page", String(params.page));
          if (params.size) query.set("size", String(params.size));

          const { data } = await api.get<PaginatedUserLikes>(
            `/projects/users/${userId}/likes?${query.toString()}`,
          );

          set({ userLikes: data.likes, totalUserLikes: data.total });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch user likes";
          set((s) => ({ errors: { ...s.errors, fetchUserLikes: message } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, fetchUserLikes: false } }));
        }
      },

      // ── GET /projects/{project_id}/liked ───────────────────
      checkUserLiked: async (projectId) => {
        set((s) => ({
          loading: { ...s.loading, checkLiked: true },
          errors: { ...s.errors, checkLiked: null },
        }));
        try {
          const { data } = await api.get<{ is_liked: boolean }>(
            `/projects/${projectId}/liked`,
          );
          set((s) => ({
            userLikedByProject: {
              ...s.userLikedByProject,
              [projectId]: data.is_liked,
            },
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to check like status";
          set((s) => ({ errors: { ...s.errors, checkLiked: message } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, checkLiked: false } }));
        }
      },

      // ── GET /projects/{project_id}/comments ────────────────
      fetchProjectComments: async (projectId, params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchComments: true },
          errors: { ...s.errors, fetchComments: null },
        }));
        try {
          const query = new URLSearchParams();
          if (params.page) query.set("page", String(params.page));
          if (params.size) query.set("size", String(params.size));
          query.set("parent_only", "true");
          if (params.sort_by) query.set("sort_by", params.sort_by);
          if (params.sort_order) query.set("sort_order", params.sort_order);

          const { data } = await api.get<PaginatedComments>(
            `/projects/${projectId}/comments?${query.toString()}`,
          );

          set((s) => ({
            commentsByProject: {
              ...s.commentsByProject,
              [projectId]: data.comments,
            },
            commentsTotalByProject: {
              ...s.commentsTotalByProject,
              [projectId]: data.total,
            },
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch comments";
          set((s) => ({ errors: { ...s.errors, fetchComments: message } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, fetchComments: false } }));
        }
      },

      // ── GET /projects/comments/{comment_id}/replies ────────
      fetchCommentReplies: async (commentId, params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchCommentReplies: true },
          errors: { ...s.errors, fetchCommentReplies: null },
        }));
        try {
          const query = new URLSearchParams();
          if (params.page) query.set("page", String(params.page));
          if (params.size) query.set("size", String(params.size));

          const { data } = await api.get<{
            replies: ProjectComment[];
            total: number;
          }>(`/projects/comments/${commentId}/replies?${query.toString()}`);

          set((s) => ({
            repliesByComment: {
              ...s.repliesByComment,
              [commentId]: data.replies,
            },
            repliesTotalByComment: {
              ...s.repliesTotalByComment,
              [commentId]: data.total,
            },
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch replies";
          set((s) => ({
            errors: { ...s.errors, fetchCommentReplies: message },
          }));
        } finally {
          set((s) => ({
            loading: { ...s.loading, fetchCommentReplies: false },
          }));
        }
      },

      // ── GET /projects/comments/{comment_id}/thread ─────────
      fetchCommentThread: async (commentId) => {
        set((s) => ({
          loading: { ...s.loading, fetchCommentThread: true },
          errors: { ...s.errors, fetchCommentThread: null },
        }));
        try {
          const { data } = await api.get<CommentThread>(
            `/projects/comments/${commentId}/thread`,
          );
          set({ commentThread: data });
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch comment thread";
          set((s) => ({
            errors: { ...s.errors, fetchCommentThread: message },
          }));
        } finally {
          set((s) => ({
            loading: { ...s.loading, fetchCommentThread: false },
          }));
        }
      },

      // ── GET /projects/users/{user_id}/comments ─────────────
      fetchUserComments: async (userId, params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchUserComments: true },
          errors: { ...s.errors, fetchUserComments: null },
        }));
        try {
          const query = new URLSearchParams();
          if (params.page) query.set("page", String(params.page));
          if (params.size) query.set("size", String(params.size));

          const { data } = await api.get<PaginatedUserComments>(
            `/projects/users/${userId}/comments?${query.toString()}`,
          );
          set({ userComments: data.comments, totalUserComments: data.total });
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch user comments";
          set((s) => ({ errors: { ...s.errors, fetchUserComments: message } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, fetchUserComments: false } }));
        }
      },

      // ── POST /projects/{project_id}/comments ───────────────
      addComment: async (projectId, data) => {
        set((s) => ({
          loading: { ...s.loading, addComment: true },
          errors: { ...s.errors, addComment: null },
        }));
        try {
          const { data: newComment } = await api.post<ProjectComment>(
            `/projects/${projectId}/comments`,
            data,
          );

          // Append comment to local state
          set((s) => {
            const existing = s.commentsByProject[projectId] ?? [];
            const isReply = !!data.parent_comment_id;

            if (isReply) {
              const parentId = data.parent_comment_id!;

              // Stitch reply into parent's inline replies array
              const updatedComments = existing.map((c) =>
                c.comment_id === parentId
                  ? {
                      ...c,
                      replies: [...(c.replies ?? []), newComment],
                      replies_count: (c.replies_count ?? 0) + 1,
                    }
                  : c,
              );

              // Also keep repliesByComment in sync so components that source
              // replies from that slice (after calling fetchCommentReplies)
              // see the new entry immediately.
              const existingReplies = s.repliesByComment[parentId] ?? [];

              return {
                commentsByProject: {
                  ...s.commentsByProject,
                  [projectId]: updatedComments,
                },
                repliesByComment: {
                  ...s.repliesByComment,
                  [parentId]: [...existingReplies, newComment],
                },
                repliesTotalByComment: {
                  ...s.repliesTotalByComment,
                  [parentId]: (s.repliesTotalByComment[parentId] ?? 0) + 1,
                },
              };
            }

            return {
              commentsByProject: {
                ...s.commentsByProject,
                [projectId]: [newComment, ...existing],
              },
              commentsTotalByProject: {
                ...s.commentsTotalByProject,
                [projectId]: (s.commentsTotalByProject[projectId] ?? 0) + 1,
              },
              // Keep engagement stats total_engagement in sync
              engagementStatsByProject: s.engagementStatsByProject[projectId]
                ? {
                    ...s.engagementStatsByProject,
                    [projectId]: {
                      ...s.engagementStatsByProject[projectId],
                      comments_count:
                        s.engagementStatsByProject[projectId].comments_count +
                        1,
                      top_level_comments_count:
                        s.engagementStatsByProject[projectId]
                          .top_level_comments_count + 1,
                      total_engagement:
                        s.engagementStatsByProject[projectId].total_engagement +
                        1,
                    },
                  }
                : s.engagementStatsByProject,
            };
          });

          return newComment;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to add comment";
          set((s) => ({ errors: { ...s.errors, addComment: message } }));
          return null;
        } finally {
          set((s) => ({ loading: { ...s.loading, addComment: false } }));
        }
      },

      // ── PUT /projects/comments/{comment_id} ────────────────
      updateComment: async (commentId, data) => {
        set((s) => ({
          loading: { ...s.loading, updateComment: true },
          errors: { ...s.errors, updateComment: null },
        }));
        try {
          await api.put(`/projects/comments/${commentId}`, data);

          // Update comment content across all slices
          set((s) => {
            // --- commentsByProject (top-level + inline replies) ---
            const updatedCommentsByProject: Record<string, ProjectComment[]> =
              {};
            for (const [pid, comments] of Object.entries(s.commentsByProject)) {
              updatedCommentsByProject[pid] = comments.map((c) => {
                if (c.comment_id === commentId)
                  return { ...c, content: data.content };
                if (c.replies?.length) {
                  return {
                    ...c,
                    replies: c.replies.map((r) =>
                      r.comment_id === commentId
                        ? { ...r, content: data.content }
                        : r,
                    ),
                  };
                }
                return c;
              });
            }

            // --- repliesByComment ---
            const updatedRepliesByComment: Record<string, ProjectComment[]> =
              {};
            for (const [cid, replies] of Object.entries(s.repliesByComment)) {
              updatedRepliesByComment[cid] = replies.map((r) =>
                r.comment_id === commentId
                  ? { ...r, content: data.content }
                  : r,
              );
            }

            // --- commentThread (patch root or any nested reply) ---
            const patchThread = (node: CommentThread): CommentThread => ({
              ...node,
              content:
                node.comment_id === commentId ? data.content : node.content,
              replies: node.replies?.map(patchThread),
            });

            return {
              commentsByProject: updatedCommentsByProject,
              repliesByComment: updatedRepliesByComment,
              commentThread: s.commentThread
                ? patchThread(s.commentThread)
                : null,
            };
          });

          return true;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to update comment";
          set((s) => ({ errors: { ...s.errors, updateComment: message } }));
          return false;
        } finally {
          set((s) => ({ loading: { ...s.loading, updateComment: false } }));
        }
      },

      // ── DELETE /projects/comments/{comment_id} ─────────────
      deleteComment: async (commentId) => {
        set((s) => ({
          loading: { ...s.loading, deleteComment: true },
          errors: { ...s.errors, deleteComment: null },
        }));
        try {
          await api.delete(`/projects/comments/${commentId}`);

          // Remove comment (and its replies) from all slices
          set((s) => {
            const updatedCommentsByProject: Record<string, ProjectComment[]> =
              {};
            const updatedCommentsTotalByProject = {
              ...s.commentsTotalByProject,
            };

            for (const [pid, comments] of Object.entries(s.commentsByProject)) {
              const isTopLevel = comments.some(
                (c) => c.comment_id === commentId,
              );

              const filtered = comments
                .filter((c) => c.comment_id !== commentId)
                .map((c) => ({
                  ...c,
                  replies:
                    c.replies?.filter((r) => r.comment_id !== commentId) ?? [],
                  replies_count: c.replies?.some(
                    (r) => r.comment_id === commentId,
                  )
                    ? Math.max(0, (c.replies_count ?? 1) - 1)
                    : c.replies_count,
                }));

              updatedCommentsByProject[pid] = filtered;

              // Decrement the total only when a top-level comment is removed
              if (
                isTopLevel &&
                updatedCommentsTotalByProject[pid] !== undefined
              ) {
                updatedCommentsTotalByProject[pid] = Math.max(
                  0,
                  updatedCommentsTotalByProject[pid] - 1,
                );
              }
            }

            // Clean up repliesByComment: remove the entry if it was a parent,
            // or remove the reply from its parent's list.
            const updatedRepliesByComment: Record<string, ProjectComment[]> =
              {};
            for (const [cid, replies] of Object.entries(s.repliesByComment)) {
              if (cid === commentId) continue; // drop the whole bucket
              updatedRepliesByComment[cid] = replies.filter(
                (r) => r.comment_id !== commentId,
              );
            }

            const updatedRepliesTotalByComment = { ...s.repliesTotalByComment };
            for (const [cid, replies] of Object.entries(s.repliesByComment)) {
              if (cid === commentId) {
                delete updatedRepliesTotalByComment[cid];
              } else if (replies.some((r) => r.comment_id === commentId)) {
                updatedRepliesTotalByComment[cid] = Math.max(
                  0,
                  (updatedRepliesTotalByComment[cid] ?? 1) - 1,
                );
              }
            }

            // Patch commentThread if it contains the deleted comment
            const removeFromThread = (
              node: CommentThread,
            ): CommentThread | null => {
              if (node.comment_id === commentId) return null;
              return {
                ...node,
                replies: node.replies
                  ?.map(removeFromThread)
                  .filter((r): r is CommentThread => r !== null),
              };
            };

            return {
              commentsByProject: updatedCommentsByProject,
              commentsTotalByProject: updatedCommentsTotalByProject,
              repliesByComment: updatedRepliesByComment,
              repliesTotalByComment: updatedRepliesTotalByComment,
              commentThread: s.commentThread
                ? removeFromThread(s.commentThread)
                : null,
            };
          });

          return true;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to delete comment";
          set((s) => ({ errors: { ...s.errors, deleteComment: message } }));
          return false;
        } finally {
          set((s) => ({ loading: { ...s.loading, deleteComment: false } }));
        }
      },

      // ── GET /projects/{project_id}/engagement ──────────────
      fetchEngagementStats: async (projectId) => {
        set((s) => ({
          loading: { ...s.loading, fetchEngagementStats: true },
          errors: { ...s.errors, fetchEngagementStats: null },
        }));
        try {
          const { data } = await api.get<ProjectEngagementStats>(
            `/projects/${projectId}/engagement`,
          );
          set((s) => ({
            engagementStatsByProject: {
              ...s.engagementStatsByProject,
              [projectId]: data,
            },
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch engagement stats";
          set((s) => ({
            errors: { ...s.errors, fetchEngagementStats: message },
          }));
        } finally {
          set((s) => ({
            loading: { ...s.loading, fetchEngagementStats: false },
          }));
        }
      },

      // ── GET /projects/{project_id}/engagement/full ─────────
      fetchFullEngagement: async (projectId, params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchFullEngagement: true },
          errors: { ...s.errors, fetchFullEngagement: null },
        }));
        try {
          const query = new URLSearchParams();
          if (params.likes_limit)
            query.set("likes_limit", String(params.likes_limit));
          if (params.comments_limit)
            query.set("comments_limit", String(params.comments_limit));

          const { data } = await api.get<FullProjectEngagement>(
            `/projects/${projectId}/engagement/full?${query.toString()}`,
          );

          set((s) => ({
            fullEngagementByProject: {
              ...s.fullEngagementByProject,
              [projectId]: data,
            },
            userLikedByProject: {
              ...s.userLikedByProject,
              [projectId]: data.user_has_liked,
            },
            engagementStatsByProject: {
              ...s.engagementStatsByProject,
              [projectId]: data.statistics,
            },
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch full engagement";
          set((s) => ({
            errors: { ...s.errors, fetchFullEngagement: message },
          }));
        } finally {
          set((s) => ({
            loading: { ...s.loading, fetchFullEngagement: false },
          }));
        }
      },

      // ── GET /projects/users/{user_id}/engagement ───────────
      fetchUserEngagementStats: async (userId) => {
        set((s) => ({
          loading: { ...s.loading, fetchUserEngagement: true },
          errors: { ...s.errors, fetchUserEngagement: null },
        }));
        try {
          const { data } = await api.get<UserEngagementStats>(
            `/projects/users/${userId}/engagement`,
          );
          set({ userEngagementStats: data });
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch user engagement stats";
          set((s) => ({
            errors: { ...s.errors, fetchUserEngagement: message },
          }));
        } finally {
          set((s) => ({
            loading: { ...s.loading, fetchUserEngagement: false },
          }));
        }
      },
    }),
    { name: "ProjectEngagementStore" },
  ),
);
