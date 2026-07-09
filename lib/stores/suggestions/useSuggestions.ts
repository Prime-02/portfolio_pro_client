import { useShallow } from "zustand/react/shallow";
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
  is_voted: boolean;
  vote_count: number;
  comment_count: number;
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

// ✅ Pagination response type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
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
  suggestionsTotal: number;
  suggestionsPage: number;
  suggestionsTotalPages: number;
  suggestionsHasNext: boolean;
  suggestionsHasPrevious: boolean;

  currentSuggestion: SuggestionResponse | null;

  mySuggestions: SuggestionResponse[];
  mySuggestionsTotal: number;
  mySuggestionsPage: number;
  mySuggestionsTotalPages: number;
  mySuggestionsHasNext: boolean;
  mySuggestionsHasPrevious: boolean;

  mySummary: UserSuggestionSummary | null;

  userSuggestions: Record<string, SuggestionResponse[]>;
  userSuggestionsMeta: Record<
    string,
    {
      total: number;
      page: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    }
  >;

  userSummaries: Record<string, UserSuggestionSummary>;
  overview: SuggestionsOverview | null;
  searchResults: SuggestionResponse[];
  searchResultsMeta: {
    total: number;
    page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  } | null;

  commentsBySuggestion: Record<string, SuggestionCommentResponse[]>;
  commentsMeta: Record<
    string,
    {
      total: number;
      page: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    }
  >;

  voteCountBySuggestion: Record<string, number>;
  userVotedBySuggestion: Record<string, boolean>;
  commentCountBySuggestion: Record<string, number>;
  myVotes: SuggestionVoteResponse[];
  myVotesMeta: {
    total: number;
    page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  } | null;

  stats: Record<string, SuggestionStats>;

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
  syncVoteStateFromSuggestions: (suggestions: SuggestionResponse[]) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSuggestionsStore = create<SuggestionsState>((set, get) => ({
  // Initial state
  suggestions: [],
  suggestionsTotal: 0,
  suggestionsPage: 1,
  suggestionsTotalPages: 1,
  suggestionsHasNext: false,
  suggestionsHasPrevious: false,

  currentSuggestion: null,

  mySuggestions: [],
  mySuggestionsTotal: 0,
  mySuggestionsPage: 1,
  mySuggestionsTotalPages: 1,
  mySuggestionsHasNext: false,
  mySuggestionsHasPrevious: false,

  mySummary: null,

  userSuggestions: {},
  userSuggestionsMeta: {},

  userSummaries: {},
  overview: null,
  searchResults: [],
  searchResultsMeta: null,

  commentsBySuggestion: {},
  commentsMeta: {},

  voteCountBySuggestion: {},
  userVotedBySuggestion: {},
  commentCountBySuggestion: {},
  myVotes: [],
  myVotesMeta: null,

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
      const { data } = await api.get<PaginatedResponse<SuggestionResponse>>(
        "/suggestions/", // ✅ Keep trailing slash
        { params },
      );
      set((s) => {
        const voteCountBySuggestion = { ...s.voteCountBySuggestion };
        const userVotedBySuggestion = { ...s.userVotedBySuggestion };
        const commentCountBySuggestion = { ...s.commentCountBySuggestion };

        data.items.forEach((suggestion) => {
          if (suggestion.is_voted !== undefined) {
            userVotedBySuggestion[suggestion.id] = suggestion.is_voted;
          }
          if (suggestion.vote_count !== undefined) {
            voteCountBySuggestion[suggestion.id] = suggestion.vote_count;
          }
          if (suggestion.comment_count !== undefined) {
            commentCountBySuggestion[suggestion.id] = suggestion.comment_count;
          }
        });

        return {
          suggestions: data.items,
          suggestionsTotal: data.total,
          suggestionsPage: data.page,
          suggestionsTotalPages: data.total_pages,
          suggestionsHasNext: data.has_next,
          suggestionsHasPrevious: data.has_previous,
          voteCountBySuggestion,
          userVotedBySuggestion,
          commentCountBySuggestion,
          loading: { ...s.loading, [key]: false },
        };
      });
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
      set((s) => {
        const voteCountBySuggestion = { ...s.voteCountBySuggestion };
        const userVotedBySuggestion = { ...s.userVotedBySuggestion };
        const commentCountBySuggestion = { ...s.commentCountBySuggestion };

        if (data.is_voted !== undefined) {
          userVotedBySuggestion[data.id] = data.is_voted;
        }
        if (data.vote_count !== undefined) {
          voteCountBySuggestion[data.id] = data.vote_count;
        }
        if (data.comment_count !== undefined) {
          commentCountBySuggestion[data.id] = data.comment_count;
        }

        return {
          currentSuggestion: data,
          voteCountBySuggestion,
          userVotedBySuggestion,
          commentCountBySuggestion,
          loading: { ...s.loading, [key]: false },
        };
      });
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
      const { data } = await api.get<PaginatedResponse<SuggestionResponse>>(
        "/suggestions/me", // ✅ No trailing slash (FastAPI redirects)
        { params: { skip, limit } },
      );
      set((s) => {
        const voteCountBySuggestion = { ...s.voteCountBySuggestion };
        const userVotedBySuggestion = { ...s.userVotedBySuggestion };
        const commentCountBySuggestion = { ...s.commentCountBySuggestion };

        data.items.forEach((suggestion) => {
          if (suggestion.is_voted !== undefined) {
            userVotedBySuggestion[suggestion.id] = suggestion.is_voted;
          }
          if (suggestion.vote_count !== undefined) {
            voteCountBySuggestion[suggestion.id] = suggestion.vote_count;
          }
          if (suggestion.comment_count !== undefined) {
            commentCountBySuggestion[suggestion.id] = suggestion.comment_count;
          }
        });

        return {
          mySuggestions: data.items,
          mySuggestionsTotal: data.total,
          mySuggestionsPage: data.page,
          mySuggestionsTotalPages: data.total_pages,
          mySuggestionsHasNext: data.has_next,
          mySuggestionsHasPrevious: data.has_previous,
          voteCountBySuggestion,
          userVotedBySuggestion,
          commentCountBySuggestion,
          loading: { ...s.loading, [key]: false },
        };
      });
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
        "/suggestions/", // ✅ Fixed: Added trailing slash
        data,
      );
      set((s) => ({
        suggestions: [created, ...s.suggestions],
        mySuggestions: [created, ...s.mySuggestions],
        suggestionsTotal: s.suggestionsTotal + 1,
        mySuggestionsTotal: s.mySuggestionsTotal + 1,
        loading: { ...s.loading, [key]: false },
      }));
      get().fetchMySummary();
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

    set((s) => ({
      loading: { ...s.loading, [key]: true },
      errors: { ...s.errors, [key]: null },
      suggestions: s.suggestions.filter((sug) => sug.id !== id),
      mySuggestions: s.mySuggestions.filter((sug) => sug.id !== id),
    }));

    try {
      await api.delete(`/suggestions/${id}`);
      set((s) => ({
        loading: { ...s.loading, [key]: false },
        suggestionsTotal: s.suggestionsTotal - 1,
        mySuggestionsTotal: s.mySuggestionsTotal - 1,
      }));
      get().fetchMySummary();
      return true;
    } catch (err) {
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
      const { data } = await api.get<
        PaginatedResponse<SuggestionCommentResponse>
      >(`/suggestions/${suggestionId}/comments`, { params: { skip, limit } });
      set((s) => ({
        commentsBySuggestion: {
          ...s.commentsBySuggestion,
          [suggestionId]: data.items,
        },
        commentsMeta: {
          ...s.commentsMeta,
          [suggestionId]: {
            total: data.total,
            page: data.page,
            total_pages: data.total_pages,
            has_next: data.has_next,
            has_previous: data.has_previous,
          },
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
      suggestions: s.suggestions.map((sug) =>
        sug.id === suggestionId
          ? {
              ...sug,
              is_voted: !prevVoted,
              vote_count: prevVoted ? prevCount - 1 : prevCount + 1,
            }
          : sug,
      ),
      currentSuggestion:
        s.currentSuggestion?.id === suggestionId
          ? {
              ...s.currentSuggestion,
              is_voted: !prevVoted,
              vote_count: prevVoted ? prevCount - 1 : prevCount + 1,
            }
          : s.currentSuggestion,
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
        suggestions: s.suggestions.map((sug) =>
          sug.id === suggestionId
            ? { ...sug, is_voted: data.user_voted, vote_count: data.vote_count }
            : sug,
        ),
        currentSuggestion:
          s.currentSuggestion?.id === suggestionId
            ? {
                ...s.currentSuggestion,
                is_voted: data.user_voted,
                vote_count: data.vote_count,
              }
            : s.currentSuggestion,
      }));
    } catch (err) {
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
        suggestions: s.suggestions.map((sug) =>
          sug.id === suggestionId
            ? { ...sug, is_voted: prevVoted, vote_count: prevCount }
            : sug,
        ),
        currentSuggestion:
          s.currentSuggestion?.id === suggestionId
            ? {
                ...s.currentSuggestion,
                is_voted: prevVoted,
                vote_count: prevCount,
              }
            : s.currentSuggestion,
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
      const { data } = await api.get<PaginatedResponse<SuggestionVoteResponse>>(
        "/suggestions/votes/me",
        { params: { skip, limit } },
      );
      set((s) => ({
        myVotes: data.items,
        myVotesMeta: {
          total: data.total,
          page: data.page,
          total_pages: data.total_pages,
          has_next: data.has_next,
          has_previous: data.has_previous,
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
      const { data } = await api.get<PaginatedResponse<SuggestionResponse>>(
        `/suggestions/users/${userId}`,
        { params: { skip, limit } },
      );
      set((s) => {
        const voteCountBySuggestion = { ...s.voteCountBySuggestion };
        const userVotedBySuggestion = { ...s.userVotedBySuggestion };
        const commentCountBySuggestion = { ...s.commentCountBySuggestion };

        data.items.forEach((suggestion) => {
          if (suggestion.is_voted !== undefined) {
            userVotedBySuggestion[suggestion.id] = suggestion.is_voted;
          }
          if (suggestion.vote_count !== undefined) {
            voteCountBySuggestion[suggestion.id] = suggestion.vote_count;
          }
          if (suggestion.comment_count !== undefined) {
            commentCountBySuggestion[suggestion.id] = suggestion.comment_count;
          }
        });

        return {
          userSuggestions: { ...s.userSuggestions, [userId]: data.items },
          userSuggestionsMeta: {
            ...s.userSuggestionsMeta,
            [userId]: {
              total: data.total,
              page: data.page,
              total_pages: data.total_pages,
              has_next: data.has_next,
              has_previous: data.has_previous,
            },
          },
          voteCountBySuggestion,
          userVotedBySuggestion,
          commentCountBySuggestion,
          loading: { ...s.loading, [key]: false },
        };
      });
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
      const { data } = await api.get<PaginatedResponse<SuggestionResponse>>(
        "/suggestions/search/", // ✅ Fixed: Consistent trailing slash
        { params: { q, skip, limit, status } },
      );
      set((s) => {
        const voteCountBySuggestion = { ...s.voteCountBySuggestion };
        const userVotedBySuggestion = { ...s.userVotedBySuggestion };
        const commentCountBySuggestion = { ...s.commentCountBySuggestion };

        data.items.forEach((suggestion) => {
          if (suggestion.is_voted !== undefined) {
            userVotedBySuggestion[suggestion.id] = suggestion.is_voted;
          }
          if (suggestion.vote_count !== undefined) {
            voteCountBySuggestion[suggestion.id] = suggestion.vote_count;
          }
          if (suggestion.comment_count !== undefined) {
            commentCountBySuggestion[suggestion.id] = suggestion.comment_count;
          }
        });

        return {
          searchResults: data.items,
          searchResultsMeta: {
            total: data.total,
            page: data.page,
            total_pages: data.total_pages,
            has_next: data.has_next,
            has_previous: data.has_previous,
          },
          voteCountBySuggestion,
          userVotedBySuggestion,
          commentCountBySuggestion,
          loading: { ...s.loading, [key]: false },
        };
      });
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

  syncVoteStateFromSuggestions: (suggestions) => {
    set((s) => {
      const voteCountBySuggestion = { ...s.voteCountBySuggestion };
      const userVotedBySuggestion = { ...s.userVotedBySuggestion };
      const commentCountBySuggestion = { ...s.commentCountBySuggestion };

      suggestions.forEach((suggestion) => {
        if (suggestion.is_voted !== undefined) {
          userVotedBySuggestion[suggestion.id] = suggestion.is_voted;
        }
        if (suggestion.vote_count !== undefined) {
          voteCountBySuggestion[suggestion.id] = suggestion.vote_count;
        }
        if (suggestion.comment_count !== undefined) {
          commentCountBySuggestion[suggestion.id] = suggestion.comment_count;
        }
      });

      return {
        voteCountBySuggestion,
        userVotedBySuggestion,
        commentCountBySuggestion,
      };
    });
  },
}));

// ---------------------------------------------------------------------------
// Convenience selectors
// ---------------------------------------------------------------------------

export const useSuggestions = () => useSuggestionsStore((s) => s.suggestions);
export const useSuggestionsPagination = () =>
  useSuggestionsStore(
    useShallow((s) => ({
      total: s.suggestionsTotal,
      page: s.suggestionsPage,
      totalPages: s.suggestionsTotalPages,
      hasNext: s.suggestionsHasNext,
      hasPrevious: s.suggestionsHasPrevious,
    })),
  );

export const useMySuggestionsPagination = () =>
  useSuggestionsStore(
    useShallow((s) => ({
      total: s.mySuggestionsTotal,
      page: s.mySuggestionsPage,
      totalPages: s.mySuggestionsTotalPages,
      hasNext: s.mySuggestionsHasNext,
      hasPrevious: s.mySuggestionsHasPrevious,
    })),
  );
export const useCurrentSuggestion = () =>
  useSuggestionsStore((s) => s.currentSuggestion);

export const useMySuggestions = () =>
  useSuggestionsStore((s) => s.mySuggestions);

export const useMySummary = () => useSuggestionsStore((s) => s.mySummary);

const EMPTY_COMMENTS: SuggestionCommentResponse[] = [];

export const useSuggestionComments = (suggestionId: string) =>
  useSuggestionsStore(
    (s) => s.commentsBySuggestion[suggestionId] ?? EMPTY_COMMENTS,
  );

export const useSuggestionCommentsMeta = (suggestionId: string) =>
  useSuggestionsStore((s) => s.commentsMeta[suggestionId] ?? null);

export const useSuggestionVoteState = (suggestionId: string) =>
  useSuggestionsStore(
    useShallow((s) => ({
      voted: s.userVotedBySuggestion[suggestionId] ?? false,
      count:
        s.voteCountBySuggestion[suggestionId] ??
        s.stats[suggestionId]?.vote_count ??
        0,
    })),
  );

export const useSuggestionCommentCount = (suggestionId: string) =>
  useSuggestionsStore(
    (s) =>
      s.commentCountBySuggestion[suggestionId] ??
      s.stats[suggestionId]?.comment_count ??
      0,
  );

export const useMyVotes = () => useSuggestionsStore((s) => s.myVotes);
export const useMyVotesPagination = () =>
  useSuggestionsStore((s) => s.myVotesMeta);

export const useSearchResults = () =>
  useSuggestionsStore((s) => s.searchResults);
export const useSearchResultsMeta = () =>
  useSuggestionsStore((s) => s.searchResultsMeta);

export const useSuggestionLoading = (action: ActionKey | string) =>
  useSuggestionsStore((s) => s.loading[action] ?? false);
export const useSuggestionError = (action: ActionKey | string) =>
  useSuggestionsStore((s) => s.errors[action] ?? null);
