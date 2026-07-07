// lib/stores/testimonials.store.ts
import { create } from "zustand";
import { api } from "@/lib/client/api";

// Types
export interface AuthorInfo {
  user_id: string;
  username: string;
  profile_picture?: string;
}

export interface Testimonial {
  id: string;
  user_id: string;
  author_user_id?: string;
  author_name: string;
  author_title?: string;
  author_company?: string;
  author_relationship?: string;
  content: string;
  rating?: number;
  avatar_url?: string;
  avatar_url_id?: string;
  is_approved: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  author_info?: AuthorInfo;
}

export interface TestimonialResponse {
  id: string;
  user_id: string;
  author_user_id?: string;
  author_name: string;
  author_title?: string;
  author_company?: string;
  author_relationship?: string;
  content: string;
  rating?: number;
  avatar_url?: string;
  avatar_url_id?: string;
  is_approved: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  author_info?: AuthorInfo;
}

export interface TestimonialCreate {
  username: string;
  author_name: string;
  author_title?: string;
  author_company?: string;
  author_relationship?: string;
  content: string;
  rating?: number;
}

export interface TestimonialUpdate {
  author_name?: string;
  author_title?: string;
  author_company?: string;
  author_relationship?: string;
  content?: string;
  rating?: number;
  is_approved?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export interface TestimonialStats {
  total_testimonials: number;
  average_rating?: number;
  testimonials_with_rating: number;
}

export interface TestimonialSummary {
  stats: TestimonialStats;
  recent_testimonials: Testimonial[];
  username: string;
  user_id: string;
}

export interface PaginatedTestimonials {
  testimonials: Testimonial[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface DeleteResponse {
  [key: string]: boolean | string | number;
}

export interface PublicTestimonialsByUsernameFilters {
  username: string;
  skip?: number;
  limit?: number;
  is_featured?: boolean;
  author_company?: string;
  author_relationship?: string;
  rating?: number;
  ids?: string[];
  merge_filters?: boolean;
}

// Ranking types
export interface UserRatingRanking {
  id: string;
  username?: string;
  email: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  profile_picture?: string;
  profile_picture_id?: string;
  phone_number?: string;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
  average_rating: number;
  profession: string;
  job_title: string;
  location: string;
  total_testimonials: number;
  highest_rated_testimonial?: TestimonialResponse;
}

export interface PaginatedUserRankingResponse {
  users: UserRatingRanking[];
  total: number;
  skip: number;
  limit: number;
}

export interface RankingFilters {
  skip?: number;
  limit?: number;
  min_testimonials?: number;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 20;

// ============================================================
// HELPERS
// ============================================================

/** Append incoming items, skipping duplicates by id */
function dedupeAppend(
  existing: Testimonial[],
  incoming: Testimonial[],
): Testimonial[] {
  const existingIds = new Set(existing.map((t) => t.id));
  return [...existing, ...incoming.filter((t) => !existingIds.has(t.id))];
}

/** Build FormData for testimonial create/update */
function buildTestimonialFormData(
  data: TestimonialCreate | TestimonialUpdate,
  avatar?: File,
): FormData {
  const formData = new FormData();
  formData.append("testimonial_data", JSON.stringify(data));
  if (avatar) {
    formData.append("author_avatar", avatar);
  }
  return formData;
}

// ============================================================
// STORE STATE
// ============================================================

interface TestimonialsState {
  // Rankings
  rankings: UserRatingRanking[];
  rankingsTotal: number;
  rankingsPage: number;
  rankingsHasMore: boolean;
  rankingsLoading: boolean;
  rankingsError: string | null;

  // Public testimonials (paginated)
  publicTestimonials: Testimonial[];
  publicTestimonialsTotal: number;
  publicTestimonialsPage: number;
  publicTestimonialsHasMore: boolean;
  publicTestimonialsLoading: boolean;
  publicTestimonialsError: string | null;

  // Search (paginated)
  searchResults: Testimonial[];
  searchTotal: number;
  searchPage: number;
  searchHasMore: boolean;
  searchLoading: boolean;
  searchError: string | null;

  // User testimonials by username (paginated)
  userTestimonials: Testimonial[];
  userTestimonialsTotal: number;
  userTestimonialsPage: number;
  userTestimonialsHasMore: boolean;
  userTestimonialsUsername: string | null;
  userTestimonialsLoading: boolean;
  userTestimonialsError: string | null;

  // User testimonials by user ID (paginated)
  userTestimonialsById: Testimonial[];
  userTestimonialsByIdTotal: number;
  userTestimonialsByIdPage: number;
  userTestimonialsByIdHasMore: boolean;
  userTestimonialsByIdUserId: string | null;
  userTestimonialsByIdLoading: boolean;
  userTestimonialsByIdError: string | null;

  // User stats
  userStats: Record<string, TestimonialStats>;
  userStatsLoading: boolean;
  userStatsError: string | null;

  // User summary
  userSummary: Record<string, TestimonialSummary>;
  userSummaryLoading: boolean;
  userSummaryError: string | null;

  // Single testimonial
  currentTestimonial: Testimonial | null;
  currentTestimonialLoading: boolean;
  currentTestimonialError: string | null;

  // My authored testimonials (paginated)
  myAuthoredTestimonials: Testimonial[];
  myAuthoredTestimonialsTotal: number;
  myAuthoredTestimonialsPage: number;
  myAuthoredTestimonialsHasMore: boolean;
  myAuthoredTestimonialsLoading: boolean;
  myAuthoredTestimonialsError: string | null;

  // My received testimonials (paginated)
  myReceivedTestimonials: Testimonial[];
  myReceivedTestimonialsTotal: number;
  myReceivedTestimonialsPage: number;
  myReceivedTestimonialsHasMore: boolean;
  myReceivedTestimonialsLoading: boolean;
  myReceivedTestimonialsError: string | null;

  // Create/Update/Delete states
  creating: boolean;
  createError: string | null;
  updating: boolean;
  updateError: string | null;
  deleting: boolean;
  deleteError: string | null;
  approving: boolean;
  approveError: string | null;

  // Admin testimonials (paginated)
  adminTestimonials: Testimonial[];
  adminTestimonialsTotal: number;
  adminTestimonialsPage: number;
  adminTestimonialsHasMore: boolean;
  adminTestimonialsLoading: boolean;
  adminTestimonialsError: string | null;

  // Admin user testimonials (paginated)
  adminUserTestimonials: Testimonial[];
  adminUserTestimonialsTotal: number;
  adminUserTestimonialsPage: number;
  adminUserTestimonialsHasMore: boolean;
  adminUserTestimonialsUserId: string | null;
  adminUserTestimonialsLoading: boolean;
  adminUserTestimonialsError: string | null;

  // Admin single testimonial
  adminCurrentTestimonial: Testimonial | null;
  adminCurrentTestimonialLoading: boolean;
  adminCurrentTestimonialError: string | null;

  // Admin mutation states
  adminUpdating: boolean;
  adminUpdateError: string | null;
  adminApproving: boolean;
  adminApproveError: string | null;
  adminDeleting: boolean;
  adminDeleteError: string | null;
  adminDeletingUserTestimonials: boolean;
  adminDeleteUserTestimonialsError: string | null;

  // Ranking actions
  fetchRankings: (params?: RankingFilters) => Promise<void>;

  // Public actions
  fetchPublicTestimonials: (params?: {
    skip?: number;
    limit?: number;
    min_rating?: number;
  }) => Promise<void>;
  searchTestimonials: (params: {
    q: string;
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  fetchUserTestimonials: (
    params: PublicTestimonialsByUsernameFilters,
  ) => Promise<void>;
  fetchUserTestimonialsById: (params: {
    userId: string;
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  fetchUserTestimonialStats: (username: string) => Promise<void>;
  fetchUserTestimonialSummary: (username: string) => Promise<void>;
  fetchTestimonial: (testimonialId: string) => Promise<void>;

  // Authenticated user actions
  fetchMyAuthoredTestimonials: (params?: {
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  fetchMyReceivedTestimonials: (params?: {
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  createTestimonial: (
    testimonialData: TestimonialCreate,
    authorAvatar?: File,
  ) => Promise<Testimonial | undefined>;
  updateTestimonial: (
    testimonialId: string,
    testimonialData: TestimonialUpdate,
    authorAvatar?: File,
  ) => Promise<void>;
  deleteTestimonial: (testimonialId: string) => Promise<void>;
  approveTestimonial: (testimonialId: string) => Promise<void>;

  // Admin actions
  fetchAdminTestimonials: (params?: {
    skip?: number;
    limit?: number;
    is_approved?: boolean;
  }) => Promise<void>;
  fetchAdminUserTestimonials: (params: {
    userId: string;
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  fetchAdminTestimonial: (testimonialId: string) => Promise<void>;
  updateAdminTestimonial: (
    testimonialId: string,
    testimonialData: TestimonialUpdate,
    authorAvatar?: File,
  ) => Promise<void>;
  approveAdminTestimonial: (testimonialId: string) => Promise<void>;
  deleteAdminTestimonial: (testimonialId: string) => Promise<void>;
  deleteAdminUserTestimonials: (userId: string) => Promise<void>;

  // Utility
  reset: () => void;
}

const initialState = {
  // Rankings
  rankings: [],
  rankingsTotal: 0,
  rankingsPage: 1,
  rankingsHasMore: false,
  rankingsLoading: false,
  rankingsError: null,

  // Public
  publicTestimonials: [],
  publicTestimonialsTotal: 0,
  publicTestimonialsPage: 1,
  publicTestimonialsHasMore: false,
  publicTestimonialsLoading: false,
  publicTestimonialsError: null,

  // Search
  searchResults: [],
  searchTotal: 0,
  searchPage: 1,
  searchHasMore: false,
  searchLoading: false,
  searchError: null,

  // User by username
  userTestimonials: [],
  userTestimonialsTotal: 0,
  userTestimonialsPage: 1,
  userTestimonialsHasMore: false,
  userTestimonialsUsername: null,
  userTestimonialsLoading: false,
  userTestimonialsError: null,

  // User by ID
  userTestimonialsById: [],
  userTestimonialsByIdTotal: 0,
  userTestimonialsByIdPage: 1,
  userTestimonialsByIdHasMore: false,
  userTestimonialsByIdUserId: null,
  userTestimonialsByIdLoading: false,
  userTestimonialsByIdError: null,

  // Stats & Summary
  userStats: {},
  userStatsLoading: false,
  userStatsError: null,
  userSummary: {},
  userSummaryLoading: false,
  userSummaryError: null,

  // Single
  currentTestimonial: null,
  currentTestimonialLoading: false,
  currentTestimonialError: null,

  // My authored
  myAuthoredTestimonials: [],
  myAuthoredTestimonialsTotal: 0,
  myAuthoredTestimonialsPage: 1,
  myAuthoredTestimonialsHasMore: false,
  myAuthoredTestimonialsLoading: false,
  myAuthoredTestimonialsError: null,

  // My received
  myReceivedTestimonials: [],
  myReceivedTestimonialsTotal: 0,
  myReceivedTestimonialsPage: 1,
  myReceivedTestimonialsHasMore: false,
  myReceivedTestimonialsLoading: false,
  myReceivedTestimonialsError: null,

  // Mutations
  creating: false,
  createError: null,
  updating: false,
  updateError: null,
  deleting: false,
  deleteError: null,
  approving: false,
  approveError: null,

  // Admin list
  adminTestimonials: [],
  adminTestimonialsTotal: 0,
  adminTestimonialsPage: 1,
  adminTestimonialsHasMore: false,
  adminTestimonialsLoading: false,
  adminTestimonialsError: null,

  // Admin user
  adminUserTestimonials: [],
  adminUserTestimonialsTotal: 0,
  adminUserTestimonialsPage: 1,
  adminUserTestimonialsHasMore: false,
  adminUserTestimonialsUserId: null,
  adminUserTestimonialsLoading: false,
  adminUserTestimonialsError: null,

  // Admin single
  adminCurrentTestimonial: null,
  adminCurrentTestimonialLoading: false,
  adminCurrentTestimonialError: null,

  // Admin mutations
  adminUpdating: false,
  adminUpdateError: null,
  adminApproving: false,
  adminApproveError: null,
  adminDeleting: false,
  adminDeleteError: null,
  adminDeletingUserTestimonials: false,
  adminDeleteUserTestimonialsError: null,
};

export const useTestimonialsStore = create<TestimonialsState>()((set, get) => ({
  ...initialState,

  // ==================== RANKING ACTIONS ====================

  fetchRankings: async (params = {}) => {
    set({ rankingsLoading: true, rankingsError: null });
    try {
      const skip = params.skip ?? 0;
      const limit = params.limit ?? DEFAULT_PAGE_SIZE;
      const page = Math.floor(skip / limit) + 1;

      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      if (params.min_testimonials !== undefined) {
        queryParams.append(
          "min_testimonials",
          params.min_testimonials.toString(),
        );
      }

      if (params.search) {
        queryParams.append("search", params.search);
      }

      const response = await api.get<PaginatedUserRankingResponse>(
        `/testimonials/rankings?${queryParams.toString()}`,
      );

      const incoming = response.data.users || [];
      const total = response.data.total || 0;

      set((s) => ({
        rankings: page > 1 ? [...s.rankings, ...incoming] : incoming,
        rankingsTotal: total,
        rankingsPage: page,
        rankingsHasMore:
          page > 1
            ? s.rankings.length + incoming.length < total
            : incoming.length < total,
        rankingsLoading: false,
      }));
    } catch (error: any) {
      set({
        rankingsError:
          error.response?.data?.detail || "Failed to fetch rankings",
        rankingsLoading: false,
      });
    }
  },

  // ==================== PUBLIC ACTIONS ====================

  fetchPublicTestimonials: async (params = {}) => {
    set({ publicTestimonialsLoading: true, publicTestimonialsError: null });
    try {
      const skip = params.skip ?? 0;
      const limit = params.limit ?? DEFAULT_PAGE_SIZE;
      const page = Math.floor(skip / limit) + 1;

      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());
      if (params.min_rating !== undefined) {
        queryParams.append("min_rating", params.min_rating.toString());
      }

      const response = await api.get<PaginatedTestimonials>(
        `/testimonials/?${queryParams.toString()}`,
      );

      const incoming = response.data.testimonials || [];
      const total = response.data.total || 0;

      set((s) => ({
        publicTestimonials:
          page > 1 ? dedupeAppend(s.publicTestimonials, incoming) : incoming,
        publicTestimonialsTotal: total,
        publicTestimonialsPage: page,
        publicTestimonialsHasMore:
          page > 1
            ? s.publicTestimonials.length + incoming.length < total
            : incoming.length < total,
        publicTestimonialsLoading: false,
      }));
    } catch (error: any) {
      set({
        publicTestimonialsError:
          error.response?.data?.detail || "Failed to fetch testimonials",
        publicTestimonialsLoading: false,
      });
    }
  },

  searchTestimonials: async (params) => {
    set({ searchLoading: true, searchError: null });
    try {
      const skip = params.skip ?? 0;
      const limit = params.limit ?? DEFAULT_PAGE_SIZE;
      const page = Math.floor(skip / limit) + 1;

      const queryParams = new URLSearchParams();
      queryParams.append("q", params.q);
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      const response = await api.get<PaginatedTestimonials>(
        `/testimonials/search?${queryParams.toString()}`,
      );

      const incoming = response.data.testimonials || [];
      const total = response.data.total || 0;

      set((s) => ({
        searchResults:
          page > 1 ? dedupeAppend(s.searchResults, incoming) : incoming,
        searchTotal: total,
        searchPage: page,
        searchHasMore:
          page > 1
            ? s.searchResults.length + incoming.length < total
            : incoming.length < total,
        searchLoading: false,
      }));
    } catch (error: any) {
      set({
        searchError:
          error.response?.data?.detail || "Failed to search testimonials",
        searchLoading: false,
      });
    }
  },

  fetchUserTestimonials: async ({ username, ...filters }) => {
    const currentState = get();
    // Reset if username changed
    if (currentState.userTestimonialsUsername !== username) {
      set({
        userTestimonials: [],
        userTestimonialsTotal: 0,
        userTestimonialsPage: 1,
        userTestimonialsHasMore: false,
        userTestimonialsUsername: username,
      });
    }

    set({ userTestimonialsLoading: true, userTestimonialsError: null });
    try {
      const skip = filters.skip ?? 0;
      const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
      const page = Math.floor(skip / limit) + 1;

      const response = await api.get<PaginatedTestimonials>(
        `/testimonials/user/${username}`,
        { params: { ...filters, skip, limit } },
      );

      const incoming = response.data.testimonials || [];
      const total = response.data.total || 0;

      set((s) => ({
        userTestimonials:
          page > 1 ? dedupeAppend(s.userTestimonials, incoming) : incoming,
        userTestimonialsTotal: total,
        userTestimonialsPage: page,
        userTestimonialsHasMore:
          page > 1
            ? s.userTestimonials.length + incoming.length < total
            : incoming.length < total,
        userTestimonialsLoading: false,
      }));
    } catch (error: any) {
      set({
        userTestimonialsError:
          error.response?.data?.detail || "Failed to fetch user testimonials",
        userTestimonialsLoading: false,
      });
    }
  },

  fetchUserTestimonialsById: async ({
    userId,
    skip = 0,
    limit = DEFAULT_PAGE_SIZE,
  }) => {
    const currentState = get();
    // Reset if userId changed
    if (currentState.userTestimonialsByIdUserId !== userId) {
      set({
        userTestimonialsById: [],
        userTestimonialsByIdTotal: 0,
        userTestimonialsByIdPage: 1,
        userTestimonialsByIdHasMore: false,
        userTestimonialsByIdUserId: userId,
      });
    }

    set({
      userTestimonialsByIdLoading: true,
      userTestimonialsByIdError: null,
    });
    try {
      const page = Math.floor(skip / limit) + 1;

      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      const response = await api.get<PaginatedTestimonials>(
        `/testimonials/user/id/${userId}?${queryParams.toString()}`,
      );

      const incoming = response.data.testimonials || [];
      const total = response.data.total || 0;

      set((s) => ({
        userTestimonialsById:
          page > 1 ? dedupeAppend(s.userTestimonialsById, incoming) : incoming,
        userTestimonialsByIdTotal: total,
        userTestimonialsByIdPage: page,
        userTestimonialsByIdHasMore:
          page > 1
            ? s.userTestimonialsById.length + incoming.length < total
            : incoming.length < total,
        userTestimonialsByIdLoading: false,
      }));
    } catch (error: any) {
      set({
        userTestimonialsByIdError:
          error.response?.data?.detail ||
          "Failed to fetch user testimonials by ID",
        userTestimonialsByIdLoading: false,
      });
    }
  },

  fetchUserTestimonialStats: async (username: string) => {
    set({ userStatsLoading: true, userStatsError: null });
    try {
      const response = await api.get<TestimonialStats>(
        `/testimonials/user/${username}/stats`,
      );
      set((state) => ({
        userStats: {
          ...state.userStats,
          [username]: response.data,
        },
        userStatsLoading: false,
      }));
    } catch (error: any) {
      set({
        userStatsError:
          error.response?.data?.detail || "Failed to fetch testimonial stats",
        userStatsLoading: false,
      });
    }
  },

  fetchUserTestimonialSummary: async (username: string) => {
    set({ userSummaryLoading: true, userSummaryError: null });
    try {
      const response = await api.get<TestimonialSummary>(
        `/testimonials/user/${username}/summary`,
      );
      set((state) => ({
        userSummary: {
          ...state.userSummary,
          [username]: response.data,
        },
        userSummaryLoading: false,
      }));
    } catch (error: any) {
      set({
        userSummaryError:
          error.response?.data?.detail || "Failed to fetch testimonial summary",
        userSummaryLoading: false,
      });
    }
  },

  fetchTestimonial: async (testimonialId: string) => {
    set({
      currentTestimonialLoading: true,
      currentTestimonialError: null,
    });
    try {
      const response = await api.get<Testimonial>(
        `/testimonials/${testimonialId}`,
      );
      set({
        currentTestimonial: response.data,
        currentTestimonialLoading: false,
      });
    } catch (error: any) {
      set({
        currentTestimonialError:
          error.response?.data?.detail || "Failed to fetch testimonial",
        currentTestimonialLoading: false,
      });
    }
  },

  // ==================== AUTHENTICATED USER ACTIONS ====================

  fetchMyAuthoredTestimonials: async (params = {}) => {
    set({
      myAuthoredTestimonialsLoading: true,
      myAuthoredTestimonialsError: null,
    });
    try {
      const skip = params.skip ?? 0;
      const limit = params.limit ?? DEFAULT_PAGE_SIZE;
      const page = Math.floor(skip / limit) + 1;

      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      const response = await api.get<PaginatedTestimonials>(
        `/testimonials/my-authored?${queryParams.toString()}`,
      );

      const incoming = response.data.testimonials || [];
      const total = response.data.total || 0;

      set((s) => ({
        myAuthoredTestimonials:
          page > 1
            ? dedupeAppend(s.myAuthoredTestimonials, incoming)
            : incoming,
        myAuthoredTestimonialsTotal: total,
        myAuthoredTestimonialsPage: page,
        myAuthoredTestimonialsHasMore:
          page > 1
            ? s.myAuthoredTestimonials.length + incoming.length < total
            : incoming.length < total,
        myAuthoredTestimonialsLoading: false,
      }));
    } catch (error: any) {
      set({
        myAuthoredTestimonialsError:
          error.response?.data?.detail ||
          "Failed to fetch authored testimonials",
        myAuthoredTestimonialsLoading: false,
      });
    }
  },

  fetchMyReceivedTestimonials: async (params = {}) => {
    set({
      myReceivedTestimonialsLoading: true,
      myReceivedTestimonialsError: null,
    });
    try {
      const skip = params.skip ?? 0;
      const limit = params.limit ?? DEFAULT_PAGE_SIZE;
      const page = Math.floor(skip / limit) + 1;

      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      const response = await api.get<PaginatedTestimonials>(
        `/testimonials/my-received?${queryParams.toString()}`,
      );

      const incoming = response.data.testimonials || [];
      const total = response.data.total || 0;

      set((s) => ({
        myReceivedTestimonials:
          page > 1
            ? dedupeAppend(s.myReceivedTestimonials, incoming)
            : incoming,
        myReceivedTestimonialsTotal: total,
        myReceivedTestimonialsPage: page,
        myReceivedTestimonialsHasMore:
          page > 1
            ? s.myReceivedTestimonials.length + incoming.length < total
            : incoming.length < total,
        myReceivedTestimonialsLoading: false,
      }));
    } catch (error: any) {
      set({
        myReceivedTestimonialsError:
          error.response?.data?.detail ||
          "Failed to fetch received testimonials",
        myReceivedTestimonialsLoading: false,
      });
    }
  },

  createTestimonial: async (testimonialData, authorAvatar) => {
    set({ creating: true, createError: null });
    try {
      const formData = buildTestimonialFormData(testimonialData, authorAvatar);

      const response = await api.post<Testimonial>("/testimonials/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({
        myAuthoredTestimonials: [
          response.data,
          ...state.myAuthoredTestimonials,
        ],
        myAuthoredTestimonialsTotal: state.myAuthoredTestimonialsTotal + 1,
        creating: false,
      }));

      return response.data;
    } catch (error: any) {
      set({
        createError:
          error.response?.data?.detail || "Failed to create testimonial",
        creating: false,
      });
      return undefined;
    }
  },

  updateTestimonial: async (testimonialId, testimonialData, authorAvatar) => {
    set({ updating: true, updateError: null });
    try {
      const formData = buildTestimonialFormData(testimonialData, authorAvatar);

      const response = await api.put<Testimonial>(
        `/testimonials/${testimonialId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      set((state) => ({
        myAuthoredTestimonials: state.myAuthoredTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        myReceivedTestimonials: state.myReceivedTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        currentTestimonial:
          state.currentTestimonial?.id === testimonialId
            ? response.data
            : state.currentTestimonial,
        updating: false,
      }));
    } catch (error: any) {
      set({
        updateError:
          error.response?.data?.detail || "Failed to update testimonial",
        updating: false,
      });
    }
  },

  deleteTestimonial: async (testimonialId: string) => {
    set({ deleting: true, deleteError: null });
    try {
      await api.delete<DeleteResponse>(`/testimonials/${testimonialId}`);

      set((state) => ({
        myAuthoredTestimonials: state.myAuthoredTestimonials.filter(
          (t) => t.id !== testimonialId,
        ),
        myAuthoredTestimonialsTotal: state.myAuthoredTestimonialsTotal - 1,
        myReceivedTestimonials: state.myReceivedTestimonials.filter(
          (t) => t.id !== testimonialId,
        ),
        myReceivedTestimonialsTotal: state.myReceivedTestimonialsTotal - 1,
        currentTestimonial:
          state.currentTestimonial?.id === testimonialId
            ? null
            : state.currentTestimonial,
        deleting: false,
      }));
    } catch (error: any) {
      set({
        deleteError:
          error.response?.data?.detail || "Failed to delete testimonial",
        deleting: false,
      });
    }
  },

  approveTestimonial: async (testimonialId: string) => {
    set({ approving: true, approveError: null });
    try {
      const response = await api.post<Testimonial>(
        `/testimonials/${testimonialId}/approve`,
      );

      set((state) => ({
        currentTestimonial:
          state.currentTestimonial?.id === testimonialId
            ? response.data
            : state.currentTestimonial,
        myReceivedTestimonials: state.myReceivedTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        userTestimonials: state.userTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        userTestimonialsById: state.userTestimonialsById.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        approving: false,
      }));
    } catch (error: any) {
      set({
        approveError:
          error.response?.data?.detail || "Failed to approve testimonial",
        approving: false,
      });
    }
  },

  // ==================== ADMIN ACTIONS ====================

  fetchAdminTestimonials: async (params = {}) => {
    set({
      adminTestimonialsLoading: true,
      adminTestimonialsError: null,
    });
    try {
      const skip = params.skip ?? 0;
      const limit = params.limit ?? DEFAULT_PAGE_SIZE;
      const page = Math.floor(skip / limit) + 1;

      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());
      if (params.is_approved !== undefined) {
        queryParams.append("is_approved", params.is_approved.toString());
      }

      const response = await api.get<PaginatedTestimonials>(
        `/admin/testimonials/?${queryParams.toString()}`,
      );

      const incoming = response.data.testimonials || [];
      const total = response.data.total || 0;

      set((s) => ({
        adminTestimonials:
          page > 1 ? dedupeAppend(s.adminTestimonials, incoming) : incoming,
        adminTestimonialsTotal: total,
        adminTestimonialsPage: page,
        adminTestimonialsHasMore:
          page > 1
            ? s.adminTestimonials.length + incoming.length < total
            : incoming.length < total,
        adminTestimonialsLoading: false,
      }));
    } catch (error: any) {
      set({
        adminTestimonialsError:
          error.response?.data?.detail || "Failed to fetch admin testimonials",
        adminTestimonialsLoading: false,
      });
    }
  },

  fetchAdminUserTestimonials: async ({
    userId,
    skip = 0,
    limit = DEFAULT_PAGE_SIZE,
  }: {
    userId: string;
    skip?: number;
    limit?: number;
  }) => {
    const currentState = get();
    // Reset if userId changed
    if (currentState.adminUserTestimonialsUserId !== userId) {
      set({
        adminUserTestimonials: [],
        adminUserTestimonialsTotal: 0,
        adminUserTestimonialsPage: 1,
        adminUserTestimonialsHasMore: false,
        adminUserTestimonialsUserId: userId,
      });
    }

    set({
      adminUserTestimonialsLoading: true,
      adminUserTestimonialsError: null,
    });
    try {
      const page = Math.floor(skip / limit) + 1;

      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      const response = await api.get<PaginatedTestimonials>(
        `/admin/testimonials/user/${userId}?${queryParams.toString()}`,
      );

      const incoming = response.data.testimonials || [];
      const total = response.data.total || 0;

      set((s) => ({
        adminUserTestimonials:
          page > 1 ? dedupeAppend(s.adminUserTestimonials, incoming) : incoming,
        adminUserTestimonialsTotal: total,
        adminUserTestimonialsPage: page,
        adminUserTestimonialsHasMore:
          page > 1
            ? s.adminUserTestimonials.length + incoming.length < total
            : incoming.length < total,
        adminUserTestimonialsLoading: false,
      }));
    } catch (error: any) {
      set({
        adminUserTestimonialsError:
          error.response?.data?.detail || "Failed to fetch user testimonials",
        adminUserTestimonialsLoading: false,
      });
    }
  },

  fetchAdminTestimonial: async (testimonialId: string) => {
    set({
      adminCurrentTestimonialLoading: true,
      adminCurrentTestimonialError: null,
    });
    try {
      const response = await api.get<Testimonial>(
        `/admin/testimonials/${testimonialId}`,
      );
      set({
        adminCurrentTestimonial: response.data,
        adminCurrentTestimonialLoading: false,
      });
    } catch (error: any) {
      set({
        adminCurrentTestimonialError:
          error.response?.data?.detail || "Failed to fetch testimonial",
        adminCurrentTestimonialLoading: false,
      });
    }
  },

  updateAdminTestimonial: async (
    testimonialId,
    testimonialData,
    authorAvatar,
  ) => {
    set({ adminUpdating: true, adminUpdateError: null });
    try {
      const formData = buildTestimonialFormData(testimonialData, authorAvatar);

      const response = await api.put<Testimonial>(
        `/admin/testimonials/${testimonialId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      set((state) => ({
        adminTestimonials: state.adminTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        adminUserTestimonials: state.adminUserTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        adminCurrentTestimonial:
          state.adminCurrentTestimonial?.id === testimonialId
            ? response.data
            : state.adminCurrentTestimonial,
        adminUpdating: false,
      }));
    } catch (error: any) {
      set({
        adminUpdateError:
          error.response?.data?.detail || "Failed to update testimonial",
        adminUpdating: false,
      });
    }
  },

  approveAdminTestimonial: async (testimonialId: string) => {
    set({ adminApproving: true, adminApproveError: null });
    try {
      const response = await api.post<Testimonial>(
        `/admin/testimonials/${testimonialId}/approve`,
      );

      set((state) => ({
        adminTestimonials: state.adminTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        adminUserTestimonials: state.adminUserTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        adminCurrentTestimonial:
          state.adminCurrentTestimonial?.id === testimonialId
            ? response.data
            : state.adminCurrentTestimonial,
        adminApproving: false,
      }));
    } catch (error: any) {
      set({
        adminApproveError:
          error.response?.data?.detail || "Failed to approve testimonial",
        adminApproving: false,
      });
    }
  },

  deleteAdminTestimonial: async (testimonialId: string) => {
    set({ adminDeleting: true, adminDeleteError: null });
    try {
      await api.delete<DeleteResponse>(`/admin/testimonials/${testimonialId}`);

      set((state) => ({
        adminTestimonials: state.adminTestimonials.filter(
          (t) => t.id !== testimonialId,
        ),
        adminTestimonialsTotal: state.adminTestimonialsTotal - 1,
        adminUserTestimonials: state.adminUserTestimonials.filter(
          (t) => t.id !== testimonialId,
        ),
        adminUserTestimonialsTotal: state.adminUserTestimonialsTotal - 1,
        adminCurrentTestimonial:
          state.adminCurrentTestimonial?.id === testimonialId
            ? null
            : state.adminCurrentTestimonial,
        adminDeleting: false,
      }));
    } catch (error: any) {
      set({
        adminDeleteError:
          error.response?.data?.detail || "Failed to delete testimonial",
        adminDeleting: false,
      });
    }
  },

  deleteAdminUserTestimonials: async (userId: string) => {
    set({
      adminDeletingUserTestimonials: true,
      adminDeleteUserTestimonialsError: null,
    });
    try {
      await api.delete<DeleteResponse>(`/admin/testimonials/user/${userId}`);

      set((state) => {
        const deletedCount = state.adminUserTestimonials.length;
        return {
          adminTestimonials: state.adminTestimonials.filter(
            (t) => t.user_id !== userId,
          ),
          adminTestimonialsTotal: state.adminTestimonialsTotal - deletedCount,
          adminUserTestimonials: [],
          adminUserTestimonialsTotal: 0,
          adminDeletingUserTestimonials: false,
        };
      });
    } catch (error: any) {
      set({
        adminDeleteUserTestimonialsError:
          error.response?.data?.detail || "Failed to delete user testimonials",
        adminDeletingUserTestimonials: false,
      });
    }
  },

  // ==================== UTILITY ====================

  reset: () => {
    set(initialState);
  },
}));
