import { create } from "zustand";
import { api } from "@/lib/client/api";
import { UserResponse } from "../user/useUserAccountStore";

// ---------------------------------------------------------------------------
// Types — mirrored from the FastAPI Pydantic schemas
// ---------------------------------------------------------------------------

export type SuggestionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "implemented";

export interface SuggestionCommentResponse {
  id: string;
  suggestion_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  user: UserResponse;
created_at: string;
  replies: SuggestionCommentResponse[];
}

export interface SuggestionVoteResponse {
  id: string;
  user_id: string;
  suggestion_id: string;
  created_at: string;
  user: UserResponse;
}

export interface SuggestionResponse {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: SuggestionStatus;
  created_at: string;
  updated_at: string | null;
  user: UserResponse;
  comments: SuggestionCommentResponse[];
  votes: SuggestionVoteResponse[];
}

export interface SuggestionCreatePayload {
  title: string;
  description: string;
  status?: SuggestionStatus;
}

export interface SuggestionUpdatePayload {
  title?: string;
  description?: string;
  status?: SuggestionStatus;
}

export interface SuggestionCommentCreatePayload {
  content: string;
  parent_comment_id?: string | null;
}

export interface SuggestionStats {
  id: string;
  title: string;
  status: SuggestionStatus;
  vote_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface UserSuggestionSummary {
  user_id: string;
  suggestions_created: number;
  remaining_suggestions: number;
  votes_cast: number;
  comments_made: number;
}

export interface SuggestionsOverview {
  total_suggestions: number;
  suggestions_by_status: Record<string, number>;
  total_comments: number;
  total_votes: number;
}

export interface ListParams {
  skip?: number;
  limit?: number;
  status?: SuggestionStatus;
  user_id?: string;
}

export interface SearchParams {
  q: string;
  skip?: number;
  limit?: number;
  status?: SuggestionStatus;
}

// ---------------------------------------------------------------------------
// Action-keyed loading / error state
// ---------------------------------------------------------------------------

type ActionKey =
  | "fetchSuggestions"
  | "fetchSuggestionById"
  | "fetchMySuggestions"
  | "fetchMySummary"
  | "createSuggestion"
  | "updateSuggestion"
  | "deleteSuggestion"
  | "fetchSuggestionStats"
  | "fetchComments"
  | "createComment"
  | "deleteComment"
  | "toggleVote"
  | "fetchVoteCount"
  | "checkVote"
  | "fetchMyVotes"
  | "fetchUserSummary"
  | "fetchUserSuggestions"
  | "fetchOverview"
  | "updateSuggestionStatus"
  | "searchSuggestions";

// Per-item action keys (e.g. deleting suggestion X) are namespaced as
// `${action}:${id}` so multiple cards can show independent loading states.
type LoadingMap = Record<string, boolean>;
type ErrorMap = Record<string, string | null>;

function extractErrorMessage(err: unknown): string {
  const anyErr = err as {
    response?: { data?: { detail?: string; message?: string } };
    message?: string;
  };
  return (
    anyErr?.response?.data?.detail ||
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    "Something went wrong. Please try again."
  );
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface SuggestionsState {
  // Data
  suggestions: SuggestionResponse[];
  suggestionsTotal: number | null;
  currentSuggestion: SuggestionResponse | null;
  mySuggestions: SuggestionResponse[];
  mySummary: UserSuggestionSummary | null;
  userSuggestions: Record<string, SuggestionResponse[]>; // keyed by user_id
  userSummaries: Record<string, UserSuggestionSummary>; // keyed by user_id
  overview: SuggestionsOverview | null;
  searchResults: SuggestionResponse[];

  commentsBySuggestion: Record<string, SuggestionCommentResponse[]>;

  voteCountBySuggestion: Record<string, number>;
  userVotedBySuggestion: Record<string, boolean>;
  myVotes: SuggestionVoteResponse[];

  stats: Record<string, SuggestionStats>; // keyed by suggestion_id

  // Per-action loading/error
  loading: LoadingMap;
  errors: ErrorMap;

  // Actions
  fetchSuggestions: (params?: ListParams) => Promise<void>;
  fetchSuggestionById: (id: string) => Promise<SuggestionResponse | null>;
  fetchMySuggestions: (skip?: number, limit?: number) => Promise<void>;
  fetchMySummary: () => Promise<void>;
  createSuggestion: (
    data: SuggestionCreatePayload,
  ) => Promise<SuggestionResponse | null>;
  updateSuggestion: (
    id: string,
    data: SuggestionUpdatePayload,
  ) => Promise<SuggestionResponse | null>;
  deleteSuggestion: (id: string) => Promise<boolean>;
  fetchSuggestionStats: (id: string) => Promise<void>;

  fetchComments: (
    suggestionId: string,
    skip?: number,
    limit?: number,
  ) => Promise<void>;
  createComment: (
    suggestionId: string,
    data: SuggestionCommentCreatePayload,
  ) => Promise<SuggestionCommentResponse | null>;
  deleteComment: (commentId: string, suggestionId: string) => Promise<boolean>;

  toggleVote: (suggestionId: string) => Promise<void>;
  fetchVoteCount: (suggestionId: string) => Promise<void>;
  checkVote: (suggestionId: string) => Promise<void>;
  fetchMyVotes: (skip?: number, limit?: number) => Promise<void>;

  fetchUserSummary: (userId: string) => Promise<void>;
  fetchUserSuggestions: (
    userId: string,
    skip?: number,
    limit?: number,
  ) => Promise<void>;
  fetchOverview: () => Promise<void>;
  updateSuggestionStatus: (
    id: string,
    newStatus: SuggestionStatus,
  ) => Promise<void>;
  searchSuggestions: (params: SearchParams) => Promise<void>;

  clearCurrentSuggestion: () => void;
  clearError: (action: ActionKey | string) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSuggestionsStore = create<SuggestionsState>((set, get) => ({
  suggestions: [],
  suggestionsTotal: null,
  currentSuggestion: null,
  mySuggestions: [],
  mySummary: null,
  userSuggestions: {},
  userSummaries: {},
  overview: null,
  searchResults: [],

  commentsBySuggestion: {},

  voteCountBySuggestion: {},
  userVotedBySuggestion: {},
  myVotes: [],

  stats: {},

  loading: {},
  errors: {},

  // ---- Suggestions ---------------------------------------------------

  fetchSuggestions: async (params) => {
    const key: ActionKey = "fetchSuggestions";
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<SuggestionResponse[]>("/suggestions/", {
        params,
      });
      set((s) => ({
        suggestions: data,
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  fetchSuggestionById: async (id) => {
    const key = `fetchSuggestionById:${id}`;
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<SuggestionResponse>(`/suggestions/${id}`);
      set((s) => ({
        currentSuggestion: data,
        loading: { ...s.loading, [key]: false },
      }));
      return data;
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
      return null;
    }
  },

  fetchMySuggestions: async (skip = 0, limit = 100) => {
    const key: ActionKey = "fetchMySuggestions";
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<SuggestionResponse[]>("/suggestions/me", {
        params: { skip, limit },
      });
      set((s) => ({
        mySuggestions: data,
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  fetchMySummary: async () => {
    const key: ActionKey = "fetchMySummary";
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<UserSuggestionSummary>(
        "/suggestions/me/summary",
      );
      set((s) => ({
        mySummary: data,
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  createSuggestion: async (data) => {
    const key: ActionKey = "createSuggestion";
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data: created } = await api.post<SuggestionResponse>(
        "/suggestions/",
        data,
      );
      set((s) => ({
        suggestions: [created, ...s.suggestions],
        mySuggestions: [created, ...s.mySuggestions],
        loading: { ...s.loading, [key]: false },
      }));
      return created;
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
      return null;
    }
  },

  updateSuggestion: async (id, data) => {
    const key = `updateSuggestion:${id}`;
    const prevSuggestions = get().suggestions;
    const prevMy = get().mySuggestions;
    const prevCurrent = get().currentSuggestion;

    // Optimistic patch
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
      suggestions: s.suggestions.map((sug) =>
        sug.id === id ? { ...sug, ...data } : sug,
      ),
      mySuggestions: s.mySuggestions.map((sug) =>
        sug.id === id ? { ...sug, ...data } : sug,
      ),
      currentSuggestion:
        s.currentSuggestion?.id === id
          ? { ...s.currentSuggestion, ...data }
          : s.currentSuggestion,
    }));

    try {
      const { data: updated } = await api.put<SuggestionResponse>(
        `/suggestions/${id}`,
        data,
      );
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        suggestions: s.suggestions.map((sug) =>
          sug.id === id ? updated : sug,
        ),
        mySuggestions: s.mySuggestions.map((sug) =>
          sug.id === id ? updated : sug,
        ),
        currentSuggestion:
          s.currentSuggestion?.id === id ? updated : s.currentSuggestion,
      }));
      return updated;
    } catch (err) {
      // Rollback
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
        suggestions: prevSuggestions,
        mySuggestions: prevMy,
        currentSuggestion: prevCurrent,
      }));
      return null;
    }
  },

  deleteSuggestion: async (id) => {
    const key = `deleteSuggestion:${id}`;
    const prevSuggestions = get().suggestions;
    const prevMy = get().mySuggestions;

    // Optimistic removal
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
      suggestions: s.suggestions.filter((sug) => sug.id !== id),
      mySuggestions: s.mySuggestions.filter((sug) => sug.id !== id),
    }));

    try {
      await api.delete(`/suggestions/${id}`);
      set((s) => ({ loading: { ...s.loading, [key]: false } }));
      return true;
    } catch (err) {
      // Rollback
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
        suggestions: prevSuggestions,
        mySuggestions: prevMy,
      }));
      return false;
    }
  },

  fetchSuggestionStats: async (id) => {
    const key = `fetchSuggestionStats:${id}`;
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<SuggestionStats>(
        `/suggestions/${id}/stats`,
      );
      set((s) => ({
        stats: { ...s.stats, [id]: data },
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  // ---- Comments --------------------------------------------------------

  fetchComments: async (suggestionId, skip = 0, limit = 100) => {
    const key = `fetchComments:${suggestionId}`;
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<SuggestionCommentResponse[]>(
        `/suggestions/${suggestionId}/comments`,
        { params: { skip, limit } },
      );
      set((s) => ({
        commentsBySuggestion: {
          ...s.commentsBySuggestion,
          [suggestionId]: data,
        },
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  createComment: async (suggestionId, data) => {
    const key = `createComment:${suggestionId}`;
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data: created } = await api.post<SuggestionCommentResponse>(
        `/suggestions/${suggestionId}/comments`,
        data,
      );

      set((s) => {
        const existing = s.commentsBySuggestion[suggestionId] || [];

        // Reply — attach under its parent instead of appending top-level
        if (created.parent_comment_id) {
          const attachReply = (
            comments: SuggestionCommentResponse[],
          ): SuggestionCommentResponse[] =>
            comments.map((c) =>
              c.id === created.parent_comment_id
                ? { ...c, replies: [...c.replies, created] }
                : { ...c, replies: attachReply(c.replies) },
            );

          return {
            commentsBySuggestion: {
              ...s.commentsBySuggestion,
              [suggestionId]: attachReply(existing),
            },
            loading: { ...s.loading, [key]: false },
          };
        }

        return {
          commentsBySuggestion: {
            ...s.commentsBySuggestion,
            [suggestionId]: [...existing, created],
          },
          loading: { ...s.loading, [key]: false },
        };
      });

      return created;
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
      return null;
    }
  },

  deleteComment: async (commentId, suggestionId) => {
    const key = `deleteComment:${commentId}`;
    const prevComments = get().commentsBySuggestion[suggestionId] || [];

    const removeComment = (
      comments: SuggestionCommentResponse[],
    ): SuggestionCommentResponse[] =>
      comments
        .filter((c) => c.id !== commentId)
        .map((c) => ({ ...c, replies: removeComment(c.replies) }));

    // Optimistic removal
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
      commentsBySuggestion: {
        ...s.commentsBySuggestion,
        [suggestionId]: removeComment(prevComments),
      },
    }));

    try {
      await api.delete(`/suggestions/comments/${commentId}`);
      set((s) => ({ loading: { ...s.loading, [key]: false } }));
      return true;
    } catch (err) {
      // Rollback
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
        commentsBySuggestion: {
          ...s.commentsBySuggestion,
          [suggestionId]: prevComments,
        },
      }));
      return false;
    }
  },

  // ---- Votes -------------------------------------------------------

  toggleVote: async (suggestionId) => {
    const key = `toggleVote:${suggestionId}`;
    const prevVoted = get().userVotedBySuggestion[suggestionId] ?? false;
    const prevCount =
      get().voteCountBySuggestion[suggestionId] ??
      get().stats[suggestionId]?.vote_count ??
      0;

    // Optimistic flip
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
      userVotedBySuggestion: {
        ...s.userVotedBySuggestion,
        [suggestionId]: !prevVoted,
      },
      voteCountBySuggestion: {
        ...s.voteCountBySuggestion,
        [suggestionId]: prevVoted ? prevCount - 1 : prevCount + 1,
      },
    }));

    try {
      const { data } = await api.post<{
        action: "added" | "removed";
        vote_count: number;
        user_voted: boolean;
      }>(`/suggestions/${suggestionId}/vote`);

      set((s) => ({
        loading: { ...s.loading, [key]: false },
        userVotedBySuggestion: {
          ...s.userVotedBySuggestion,
          [suggestionId]: data.user_voted,
        },
        voteCountBySuggestion: {
          ...s.voteCountBySuggestion,
          [suggestionId]: data.vote_count,
        },
      }));
    } catch (err) {
      // Rollback
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
        userVotedBySuggestion: {
          ...s.userVotedBySuggestion,
          [suggestionId]: prevVoted,
        },
        voteCountBySuggestion: {
          ...s.voteCountBySuggestion,
          [suggestionId]: prevCount,
        },
      }));
    }
  },

  fetchVoteCount: async (suggestionId) => {
    const key = `fetchVoteCount:${suggestionId}`;
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<{
        suggestion_id: string;
        vote_count: number;
      }>(`/suggestions/${suggestionId}/votes/count`);
      set((s) => ({
        voteCountBySuggestion: {
          ...s.voteCountBySuggestion,
          [suggestionId]: data.vote_count,
        },
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  checkVote: async (suggestionId) => {
    const key = `checkVote:${suggestionId}`;
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<{
        suggestion_id: string;
        user_voted: boolean;
      }>(`/suggestions/${suggestionId}/votes/check`);
      set((s) => ({
        userVotedBySuggestion: {
          ...s.userVotedBySuggestion,
          [suggestionId]: data.user_voted,
        },
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  fetchMyVotes: async (skip = 0, limit = 100) => {
    const key: ActionKey = "fetchMyVotes";
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<SuggestionVoteResponse[]>(
        "/suggestions/votes/me",
        { params: { skip, limit } },
      );
      set((s) => ({
        myVotes: data,
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  // ---- Admin / user-scoped -------------------------------------------

  fetchUserSummary: async (userId) => {
    const key = `fetchUserSummary:${userId}`;
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<UserSuggestionSummary>(
        `/suggestions/users/${userId}/summary`,
      );
      set((s) => ({
        userSummaries: { ...s.userSummaries, [userId]: data },
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  fetchUserSuggestions: async (userId, skip = 0, limit = 100) => {
    const key = `fetchUserSuggestions:${userId}`;
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<SuggestionResponse[]>(
        `/suggestions/users/${userId}`,
        { params: { skip, limit } },
      );
      set((s) => ({
        userSuggestions: { ...s.userSuggestions, [userId]: data },
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  fetchOverview: async () => {
    const key: ActionKey = "fetchOverview";
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<SuggestionsOverview>(
        "/suggestions/stats/overview",
      );
      set((s) => ({
        overview: data,
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  updateSuggestionStatus: async (id, newStatus) => {
    const key = `updateSuggestionStatus:${id}`;
    const prevSuggestions = get().suggestions;
    const prevMy = get().mySuggestions;
    const prevCurrent = get().currentSuggestion;

    // Optimistic patch
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
      suggestions: s.suggestions.map((sug) =>
        sug.id === id ? { ...sug, status: newStatus } : sug,
      ),
      mySuggestions: s.mySuggestions.map((sug) =>
        sug.id === id ? { ...sug, status: newStatus } : sug,
      ),
      currentSuggestion:
        s.currentSuggestion?.id === id
          ? { ...s.currentSuggestion, status: newStatus }
          : s.currentSuggestion,
    }));

    try {
      const { data: updated } = await api.patch<SuggestionResponse>(
        `/suggestions/${id}/status`,
        null,
        { params: { new_status: newStatus } },
      );
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        suggestions: s.suggestions.map((sug) =>
          sug.id === id ? updated : sug,
        ),
        mySuggestions: s.mySuggestions.map((sug) =>
          sug.id === id ? updated : sug,
        ),
        currentSuggestion:
          s.currentSuggestion?.id === id ? updated : s.currentSuggestion,
      }));
    } catch (err) {
      // Rollback
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
        suggestions: prevSuggestions,
        mySuggestions: prevMy,
        currentSuggestion: prevCurrent,
      }));
    }
  },

  searchSuggestions: async ({ q, skip = 0, limit = 50, status }) => {
    const key: ActionKey = "searchSuggestions";
    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
    }));
    try {
      const { data } = await api.get<{
        query: string;
        status_filter: string | null;
        results: SuggestionResponse[];
        count: number;
      }>("/suggestions/search/", { params: { q, skip, limit, status } });
      set((s) => ({
        searchResults: data.results,
        loading: { ...s.loading, [key]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        errors: { ...s.errors, [key]: extractErrorMessage(err) },
      }));
    }
  },

  clearCurrentSuggestion: () => set({ currentSuggestion: null }),

  clearError: (action) =>
    set((s) => ({ errors: { ...s.errors, [action]: null } })),
}));

// ---------------------------------------------------------------------------
// Convenience selectors (granular — avoid over-subscribing components)
// ---------------------------------------------------------------------------

export const useSuggestions = () => useSuggestionsStore((s) => s.suggestions);
export const useCurrentSuggestion = () =>
  useSuggestionsStore((s) => s.currentSuggestion);
export const useMySuggestions = () =>
  useSuggestionsStore((s) => s.mySuggestions);
export const useMySummary = () => useSuggestionsStore((s) => s.mySummary);

export const useSuggestionComments = (suggestionId: string) =>
  useSuggestionsStore((s) => s.commentsBySuggestion[suggestionId] ?? []);

export const useSuggestionVoteState = (suggestionId: string) =>
  useSuggestionsStore((s) => ({
    voted: s.userVotedBySuggestion[suggestionId] ?? false,
    count:
      s.voteCountBySuggestion[suggestionId] ??
      s.stats[suggestionId]?.vote_count ??
      0,
  }));

export const useSuggestionLoading = (action: ActionKey | string) =>
  useSuggestionsStore((s) => s.loading[action] ?? false);
export const useSuggestionError = (action: ActionKey | string) =>
  useSuggestionsStore((s) => s.errors[action] ?? null);
